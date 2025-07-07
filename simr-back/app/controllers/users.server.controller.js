"use strict";

const User = require("mongoose").model("User");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpiration
} = require('../../utils/tokenUtils');
const { successResponse, errorResponse } = require('../../utils/responseHelpers');
const { cookieHelpers } = require('../../config/cookieConfig'); //TODO Implementar helpers

//* Función para obtener un usuario seguro
// Esta función se usa para evitar enviar información sensible del usuario al cliente
const getSafeUser = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email
  };
}

// Manejador de errores
const getErrorMessage = (err) => {
  // Definir variable de error message
  let message = "";
  // Si ocurre un error interno de MongoDB
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "El usuario ya existe";
        break;
      // si un error general ocurre
      default:
        message = "Se ha producido un error";
    }
  } else {
    // Grabar el error en una lista de posibles errores
    for (let errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  // Devolver el mensaje de error
  return message;
};


//* SIGNUP - Registro de usuario
exports.signup = async (req, res, next) => {
  // Si user no esta conectado, crear y hacer login a un nuevo usuario
  if (req.user) {
    return res.status(403).json({
      success: false,
      message: 'Usuario ya registrado'
    });
  }

  try {
    // Crear usuario con tokens
    const { user, tokens } = await User.createUserWithTokens(req.body);

    // Configurar cookies seguras
    const cookiesSaved = cookieHelpers.setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken
    );

    if (!cookiesSaved) {
      console.warn('Hubo problemas configurando las cookies');
    }

    // Devolvemos el token y los datos del usuario
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: getSafeUser(user),
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      },
      redirectUrl: process.env.ANGULARJS_APP_URL || 'http://localhost:3000'
    });
  } catch (error) {
    console.error('Error en signup:', error);

    // Si ocurre un error, obtenemos el mensaje de error
    const message = getErrorMessage(error);
    res.status(400).json({ success: false, message, error });
  }
};

//* LOGIN - Inicio de sesión
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {

    console.log('LOGIN: passport.authenticate (backend) - user:', user);
    console.log('LOGIN: passport.authenticate (backend) - info:', info);

    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
      // return next(err);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Credenciales inválidas'
      });
    }

    try {
      // Limpiar refresh tokens expirados
      user.cleanExpiredTokens();

      // Generar nuevos tokens
      const { accessToken, refreshToken, jti } = generateTokens(user._id);

      // Guardar refresh token en la base de datos
      user.addRefreshToken({
        token: refreshToken,
        jti,
        expiresAt: getTokenExpiration(refreshToken)
      });

      await user.save();

      // Configurar cookies seguras
      const cookiesSaved = cookieHelpers.setAuthCookies(res, accessToken, refreshToken);

      if (!cookiesSaved) {
        console.warn('Hubo problemas configurando las cookies');
      }

      // Respuesta para el cliente
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: getSafeUser(user),
        tokens: {
          accessToken,
          expiresIn: process.env.JWT_EXPIRATION
        }
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

//* REFRESH TOKEN - Actualización de tokens
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token no encontrado'
    });
  }

  try {
    // Verificar el refresh token
    const decoded = verifyRefreshToken(refreshToken);
    console.log('(user.controller) REFRESH TOKEN: decoded:', decoded);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }

    // Buscar usuario y verificar que el token existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Limpiar refresh tokens expirados
    user.cleanExpiredTokens();

    // Verificar si el JTI existe en la base de datos, y extrae el token correspondiente
    const validToken = user.findValidRefreshToken(decoded.jti);

    console.log('(user.controller) validToken:', validToken);

    if (!validToken) {
      return res.status(403).json({ message: 'Refresh token revocado o expirado' });
    }

    // Generar nuevos tokens
    const { accessToken, refreshToken: newRefreshToken, jti: newJti } = generateTokens(user._id);

    // Reemplazar el token anterior del campo refreshTokens del Usuario
    const result = user.rotateRefreshToken({
      oldJti: decoded.jti,
      newToken: newRefreshToken,
      newJti,
      newExpiresAt: getTokenExpiration(newRefreshToken),
      allowInsertIfMissing: false
    })

    if (result === 'not_found') {
      return res.status(403).json({ message: 'Refresh token no renovado' });
    }

    await user.save();

    // Actualizar cookies
    const cookiesUpdated = cookieHelpers.setAuthCookies(res, accessToken, newRefreshToken);

    if (!cookiesUpdated) {
      console.warn('Hubo problemas actualizando las cookies');
    }

    // Responder al cliente con los nuevos tokens
    res.json({
      success: true,
      message: 'Token actualizado exitosamente',
      tokens: {
        accessToken,
        expiresIn: process.env.JWT_EXPIRATION
      }
    });
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expirado'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }

    // Error genérico
    console.error('Error al refrescar el token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

//* LOGOUT - Cierre de sesión
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Verificar y decodificar el refresh token
      const decoded = verifyRefreshToken(refreshToken);

      console.log('(user.controller) LOGOUT: decoded:', decoded);

      // Remover refresh token de la base de datos
      if (decoded && decoded.id && decoded.jti) {
        // Buscar usuario y remover el refresh token por JTI
        const user = await User.findById(decoded.id);
        if (user && user.refreshTokens) {
          // Invalidar refreshtoken
          const wasTokenInvalidated = user.invalidateRefreshToken(decoded.jti);

          // Solo guardar si realmente se eliminó algo
          // if (user.refreshTokens.length < initialLength) {
          if (wasTokenInvalidated) {
            await user.save();
            console.log(`Token con JTI ${decoded.jti} eliminado para usuario ${user._id}`);
          } else {
            console.log(`Token con JTI ${decoded.jti} no encontrado para usuario ${user._id}`);
          }
        }
      } else {
        // Token inválido o expirado
        console.log('Token inválido o expirado durante logout');
      }
    }

    // Limpiar cookies
    const cookiesCleared = cookieHelpers.clearAuthCookies(res);

    if (!cookiesCleared) {
      console.warn('Hubo problemas limpiando las cookies');
    }

    res.json({ success: true, message: 'Cierre de sesión exitoso' });
  } catch (error) {
    console.error('Error durante logout:', error);

    // Aún limpiar cookies aunque haya error
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(500).json({
      success: false,
      message: 'Error durante logout, pero sesión cerrada localmente'
    });
  }
};

//* VERIFY TOKEN - Verificar autenticación
exports.verifyToken = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    res.json({
      success: true,
      user: getSafeUser(user)
    });
  })(req, res, next);
};


// Crear un nuevo método controler 'create'
exports.create = async (req, res, next) => {
  try {
    // Crear una nueva instancia del model Mongoose 'User', que se puebla usando la petición body del request
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    // Llamar al siguiente middleware con un mensaje de error
    return next(err);
  }
};

// Crear un nuevo método controller 'list'
exports.list = async (req, res, next) => {
  try {
    // Usa el método static 'User' 'find' para recuperar la lista de usuarios
    // 'username email',{skip: 10, limit: 10}
    const users = await User.find({});
    // Usa el objeto 'response para enviar una respuesta JSON'
    res.json(users);
  } catch (err) {
    // Llama al siguiente middleware con un mensaje de error
    return next(err);
  }
};

exports.read = (req, res) => {
  // Usa el objeto 'response' para enviar una respuesta JSON
  res.json(req.user);
};

exports.update = async (req, res, next) => {
  try {
    // Usa el método static 'findByIdAndUpdate' de 'User' para actualizar
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    // Usa el objeto 'response para enviar una respuesta JSON'
    res.json(user);
  } catch (err) {
    // Llama al sgte middleware
    return next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // Usamos el método 'remove' de la instancia 'User' para eliminar un dcto
    // await req.user.remove();
    await req.user.deleteOne();
    res.json(req.user);
  } catch (err) {
    return next(err);
  }
};

exports.userByID = async (req, res, next, id) => {
  try {
    // Usa el método static 'findOne' de 'User' para recuperar un usuario específico
    const user = await User.findOne({ _id: id });
    if (!user) {
      return next(new Error("Error al cargar usuario " + id));
    }
    // Configura la propiedad ´req.user'
    req.user = user;
    // Llama al siguiente middleware
    next();
  } catch (err) {
    // Llama al sgte middleware con mensaje de error
    return next(err);
  }
};



// Generar token JWT para el usuario
// const generateToken = (user) => {
//   const payload = getSafeUser(user);
//   // Si el usuario cambia su fullName, no se reflejará hasta que genere un nuevo token (típicamente en el próximo login)

//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
// };

// (backup de generateToken)
// const generateToken = (user) => {
//   const payload = {
//     id: user._id,
//     username: user.username,
//     email: user.email,
//     fullName: user.fullName
//   };
//   // Si el usuario cambia su fullName, no se reflejará hasta que genere un nuevo token (típicamente en el próximo login)

//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
// };


// Controller que renderiza la página signin
// exports.renderSignin = (req, res, next) => {
exports.renderLogin = (req, res, next) => {
  // Si el usuario no está conectado, renderizar signin, en otro caso redireccionar al usuario
  if (!req.user) {
    // Usa el objeto 'response' para renderizar la página
    // res.render("signin", {
    res.render("login", {
      // Reconfigurar la variable title de la página
      title: "Página de registro",
      // Configurar la variable del mensaje flash
      // messages: req.flash("error") || req.flash("info"),
      messages: ['Credenciales inválidas'],
    });
  } else {
    return res.redirect("/");
  }
};

// Controller que renderiza la página signup
exports.renderSignup = (req, res, next) => {
  // Si el usuario no está conectado, renderizar la página signin, en otro caso, redireccionar al usuario
  if (!req.user) {
    // Usa el objeto 'response' para renderizar la página
    res.render("signup", {
      title: "Página de registro",
      // Configura la variable para el mensaje flash
      // messages: req.flash("error"),
      messages: ['Error al registrar usuario'],
    });
  } else {
    return res.redirect("/");
  }
};

// Controller para signin
// exports.signin = () => {
//   passport.authenticate('local',{
// 		successRedirect:'/',
// 		failureRedirect:'/signin',
// 		failureFlash:true
// 	})
// };





// Controller para Google OAuth con JWT
exports.googleCallback = (req, res) => {
  // Después de la autenticación exitosa con Google
  const token = generateToken(req.user);
  const safeUser = getSafeUser(req.user);
};

// Middleware controller para autorizar operaciones
// * [Metodo original de requiresLogin]
// exports.requiresLogin = (req, res, next) => {
//   if (!req.isAuthenticated()) {
//     return res.status(401).send({
//       message: "Usuario no autorizado",
//       redirect: "/",
//     });
//   }
//   // Llamar siguiente middleware
//   next();
// };

//* REQUIRES LOGIN - Middleware controller para autorizar operaciones basado en JWT
exports.requiresLogin = (req, res, next) => {
  console.log('Entrando al middleware requiresLogin...');

  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Token inválido o expirado'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

//* HAS AUTHORIZATION - Controller middleware para autorizar una operación
// TODO: Remover este método de los demás controllers
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.idioma.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};

