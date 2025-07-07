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
const { cookieHelpers } = require('../../config/cookieConfig');

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
    return errorResponse(res, 'Usuario ya conectado', 403);
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
    successResponse(res, 'Usuario registrado exitosamente', 201, {
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
    errorResponse(res, message, 400, { error: error.message || 'Error al registrar usuario' });
  }
};

//* LOGIN - Inicio de sesión
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {

    console.log('LOGIN: passport.authenticate (backend) - user:', user);
    console.log('LOGIN: passport.authenticate (backend) - info:', info);

    if (err) {
      return errorResponse(res, 'Error de autenticación', 500);
      // return next(err);
    }

    if (!user) {
      console.warn('LOGIN: Usuario no encontrado o credenciales inválidas');
      return errorResponse(res, info?.message || 'Credenciales inválidas', 401);
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
      successResponse(res, 'Inicio de sesión exitoso', 200, {
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
    return errorResponse(res, 'Refresh token no encontrado', 401);
  }

  try {
    // Verificar el refresh token
    const decoded = verifyRefreshToken(refreshToken);
    console.log('(user.controller) REFRESH TOKEN: decoded:', decoded);
    if (!decoded) {
      return errorResponse(res, 'Refresh token inválido', 401);
    }

    // Buscar usuario y verificar que el token existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 401);
    }

    // Limpiar refresh tokens expirados
    user.cleanExpiredTokens();

    // Verificar si el JTI existe en la base de datos, y extrae el token correspondiente
    const validToken = user.findValidRefreshToken(decoded.jti);

    console.log('(user.controller) validToken:', validToken);

    if (!validToken) {
      return errorResponse(res, 'Refresh token revocado o expirado', 403);
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
      return errorResponse(res, 'Refresh token no renovado', 403);
    }

    await user.save();

    // Actualizar cookies
    const cookiesUpdated = cookieHelpers.setAuthCookies(res, accessToken, newRefreshToken);

    if (!cookiesUpdated) {
      console.warn('Hubo problemas actualizando las cookies');
    }

    // Responder al cliente con los nuevos tokens
    successResponse(res, 'Token actualizado exitosamente', 200, {
      tokens: {
        accessToken,
        expiresIn: process.env.JWT_EXPIRATION
      }
    });
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Refresh token expirado', 401);
    } else if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Refresh token inválido', 401);
    }

    // Error genérico
    console.error('Error al refrescar el token:', error);
    errorResponse(res, 'Error interno del servidor', 500);
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

    // Responder al cliente
    successResponse(res, 'Cierre de sesión exitoso', 200);
  } catch (error) {
    console.error('Error durante logout:', error);

    // Aún limpiar cookies aunque haya error
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    errorResponse(res, 'Error durante logout, pero sesión cerrada localmente', 500);
  }
};

//* VERIFY TOKEN - Verificar autenticación
exports.verifyToken = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return errorResponse(res, 'Token inválido o expirado', 401);
    }

    // Responder con el usuario seguro
    successResponse(res, 'Token verificado exitosamente', 200, {
      user: getSafeUser(user)
    });
  })(req, res, next);
};

//* CREATE - Crear un nuevo usuario
exports.create = async (req, res, next) => {
  try {
    const user = await User.createUser(req.body);
    if (!user) {
      return errorResponse(res, 'Error al crear usuario', 400);
    };

    console.log('Usuario creado:', user);
    successResponse(res, 'Usuario creado exitosamente', 201, getSafeUser(user));
  } catch (err) {
    errorResponse(res, getErrorMessage(err), 400, { error: err.message || 'Error al crear usuario' });
    // Llamar al siguiente middleware con un mensaje de error
    // return next(err);
  }
};

//* LIST - Recuperar una lista de usuarios
exports.list = async (req, res, next) => {
  try {
    // Usa el método static 'User' 'find' para recuperar la lista de usuarios
    // 'username email',{skip: 10, limit: 10}
    const users = await User.find({});
    // Usa el objeto 'response para enviar una respuesta JSON'
    successResponse(res, 'Lista de usuarios recuperada exitosamente', 200, users);
    // res.json(users);
  } catch (err) {
    // Llama al siguiente middleware con un mensaje de error
    return next(err);
  }
};

//* READ - Recuperar un usuario específico
exports.read = (req, res) => {
  // Usa el objeto 'response' para enviar una respuesta JSON
  successResponse(res, 'Usuario recuperado exitosamente', 200, getSafeUser(req.user));
  res.json(req.user);
};

//* UPDATE - Actualizar un usuario específico
exports.update = async (req, res, next) => {
  try {
    // Usa el método static 'findByIdAndUpdate' de 'User' para actualizar
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    // Usa el objeto 'response para enviar una respuesta JSON'
    successResponse(res, 'Usuario actualizado exitosamente', 200, getSafeUser(user));
    // res.json(user);
  } catch (err) {
    // Llama al sgte middleware
    return next(err);
  }
};

//* DELETE - Eliminar un usuario específico
exports.delete = async (req, res, next) => {
  try {
    // Usamos el método 'remove' de la instancia 'User' para eliminar un dcto
    // await req.user.remove();
    await req.user.deleteOne();
    successResponse(res, 'Usuario eliminado exitosamente', 200);
    // res.json(req.user);
  } catch (err) {
    return next(err);
  }
};

//* USER BY ID - Middleware para recuperar un usuario por ID
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

//* RENDER LOGIN - Renderizar la página de inicio de sesión
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

//* RENDER SIGNUP - Controller que renderiza la página signup
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

// Controller para Google OAuth con JWT
exports.googleCallback = (req, res) => {
  // Después de la autenticación exitosa con Google
  const token = generateToken(req.user);
  const safeUser = getSafeUser(req.user);
};

//* REQUIRES LOGIN - Middleware controller para autorizar operaciones basado en JWT
exports.requiresLogin = (req, res, next) => {
  console.log('Entrando al middleware requiresLogin...');

  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return errorResponse(res, 'Acceso no autorizado. Token inválido o expirado', 401);
      // return res.status(401).json({
      //   success: false,
      //   message: 'Acceso no autorizado. Token inválido o expirado'
      // });
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
    return errorResponse(res, 'Usuario no autorizado', 403);
    // return res.status(403).send({
    //   message: "Usuario no autorizado",
    // });
  }
  // Llamar sgte middleware
  next();
};

