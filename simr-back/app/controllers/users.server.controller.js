"use strict";

const User = require("mongoose").model("User");
const passport = require("passport");
const jwt = require('jsonwebtoken');
// const { get } = require("mongoose");
const { generateTokens, verifyRefreshToken, getTokenExpiration } = require('../../utils/tokenUtils');

//* Configuración de cookies seguras
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS en producción
  sameSite: 'lax', // Permite cookies entre subdominios. (Usar 'strict' si no se necesita compartir cookies entre subdominios)
  maxAge: process.env.JWT_REFRESH_EXPIRATION
};
// maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días

//* Función para obtener un usuario seguro
// Esta función se usa para evitar enviar información sensible del usuario al cliente
const getSafeUser = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email
  };
}

//* LOGIN - Inicio de sesión
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Error interno del servidor' });
      // return next(err);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Credenciales inválidas'
      });
    }

    try {
      // Limpiar tokens expirados
      user.cleanExpiredTokens();

      // Generar nuevos tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      // Guardar refresh token en la base de datos
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: getTokenExpiry(refreshToken)
      });

      await user.save();

      // Configurar cookies
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: process.env.JWT_EXPIRATION
      });
      // maxAge: 15 * 60 * 1000 // 15 minutos

      res.cookie('refreshToken', refreshToken, cookieOptions);

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
      // expiresIn: 15 * 60 // 15 minutos en segundos
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

//* REFRESH TOKEN - Actualización de tokens
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no encontrado'
      });
    }

    // Verificar el refresh token
    const decoded = verifyRefreshToken(refreshToken);
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

    // Verifica si el refreshToken recibido es válido y vigente en la lista de tokens almacenados del usuario
    const tokenExists = user.refreshTokens.some(
      tokenObj => tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no válido'
      });
    }

    // Generar nuevos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Reemplazar el refresh token anterior
    user.refreshTokens = user.refreshTokens.filter(
      tokenObj => tokenObj.token !== refreshToken
    );

    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: getTokenExpiration(newRefreshToken)
    });

    await user.save();

    // Actualizar cookies
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: process.env.JWT_EXPIRATION
    });
    //   maxAge: 15 * 60 * 1000 // 15 minutos

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.json({
      success: true,
      tokens: {
        accessToken,
        expiresIn: process.env.JWT_EXPIRATION
      }
    });
    // expiresIn: 15 * 60 // 15 minutos en segundos
  } catch (error) {
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
      // Remover refresh token de la base de datos
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(
            tokenObj => tokenObj.token !== refreshToken
          );
          await user.save();
        }
      }
    }

    // Limpiar cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Cierre de sesión exitoso' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error durante logout'
    });
  }
};

//* VERIFY TOKEN - Verificar autenticación
exports.verifyToken = (req, res) => {
  passport.authenticate('jwt', { session: false }), (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    res.json({
      success: true,
      user: getSafeUser(req.user)
    });
  }
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

// Crear controller manejador de errores
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

// Generar token JWT para el usuario
const generateToken = (user) => {
  const payload = getSafeUser(user);
  // Si el usuario cambia su fullName, no se reflejará hasta que genere un nuevo token (típicamente en el próximo login)

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

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


// * [Metodo original de signin]
// exports.signin = (req, res, next) => {
//   passport.authenticate('local', (err, user) => {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.status(401).json({ message: 'Authentication failed' });
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err);
//       }
//       const safeUser = {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//       };
//       // res.json({ message: 'Authentication successful', user: safeUser });
//       // res.status(200).json({ message: 'Authentication successful', user: safeUser });
//       return res.redirect("/");
//       // res.status(200).json({
//       //   message: 'Authentication successful',
//       //   user: safeUser,
//       //   redirectUrl: '/home' // Cambia esta URL según sea necesario
//       // });
//     });
//   })(req, res, next);
// };


// exports.signin = (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.status(401).json({ message: 'Autenticación fallida', info });
//     }

//     req.login(user, { session: false }, (err) => {
//       if (err) {
//         return next(err);
//       }

//       // Generamos el token JWT
//       const token = generateToken(user);

//       // Configuramos los datos seguros del usuario para devolver
// const safeUser = {
//   id: user._id,
//   username: user.username,
//   email: user.email,
//   fullName: user.fullName
// };

//       // Devolvemos el token y los datos del usuario
//       return res.status(200).json({
//         message: 'Autenticación exitosa',
//         token,
//         user: safeUser
//       });
//     });
//   })(req, res, next);
// };

// Controller para Google OAuth con JWT
exports.googleCallback = (req, res) => {
  // Después de la autenticación exitosa con Google
  const token = generateToken(req.user);
  const safeUser = getSafeUser(req.user);

  // const safeUser = {
  //   id: req.user._id,
  //   username: req.user.username,
  //   email: req.user.email,
  //   fullName: req.user.fullName
  // };

  // Redireccionar a la página principal con el token como parámetro de consulta
  // En el frontend, puedes capturar este token y almacenarlo en localStorage
  res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify(safeUser))}`);
};


// {
//   successRedirect: '/',
//   failureRedirect: '/signin',
//   failureFlash: true
// }

// // Ruta Protegida
// app.get('/profile', (req, res) => {
//   if (!req.isAuthenticated()) {
//     return res.redirect('/login');
//   }
//   res.send(`Hola ${req.user.username}`);
// });

// Controller para signout
// * [Metodo original de signout]
// exports.signout = (req, res, next) => {
//   // Usa el método logout de passport con respectivo callback para salir
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     // Redirecciona al usuario de vuelta a la página principal
//     res.redirect('/');
//   });
// };

// exports.signout = (req, res) => {
//   // Con JWT, el logout es principalmente manejado por el cliente
//   // Solo necesitamos responder con un mensaje de éxito
//   res.status(200).json({ message: 'Sesión cerrada exitosamente' });
// };


// Obtener usuario actual
// exports.currentUser = (req, res) => {
//   passport.authenticate('jwt-access', { session: false }),
//     (req, res) => {
//       res.json({
//         user: getSafeUser(req.user)
//       });

//       // (req, res) => {
//       //   res.json({
//       //     user: {
//       //       id: req.user._id,
//       //       username: req.user.username,
//       //       email: req.user.email,
//       //       fullName: req.user.fullName
//       //     }
//       //   });

//     }
// }

// Controller para crear nuevo usuario
// * [Metodo original de signup]
// exports.signup = async (req, res, next) => {
//   // Si user no esta conectado, crear y hacer login a un nuevo usuario
//   if (!req.user) {
//     try {
//       // Crear una nueva instancia del modelo 'User'
//       // console.log(req.body);
//       const user = new User(req.body);
//       // Configurar la propiedad user provider
//       user.provider = "local";
//       // Intenta salvar el documento user
//       await user.save();
//       req.login(user, function (err) {
//         // Si ocurre error de login moverse al siguiente middleware
//         if (err) return next(err);
//         // Redirecciona de nuevo a la página principal
//         return res.redirect("/");
//         // return res.status(200).json({ message: 'Registro exitoso', user });

//         // const { _id, username, email } = user;
//         // return res.status(200).json({ message: 'Registro exitoso', user: { _id, username, email } });
//       });
//     } catch (err) {
//       // Si ocurre un error, lo reporta usando el mensaje flash
//       // Usa el método de manejo de errores para obtener el error
//       const message = getErrorMessage(err);
//       // Configura los mensajes flash
//       req.flash("error", message);
//       // Redirecciona al usuario de vuelta a signup
//       // return res.redirect("/signup");
//       return res.status(500).json({ message: 'Error en el registro', err });
//     }
//   } else {
//     // return res.redirect("/");
//     // return res.status(200).json({ message: 'Registro exitoso', user });
//     // return res.status(200).json({ message: 'Registro exitoso', user: { id, username, email } });
//     return res.status(405).send({ message: 'Usuario ya registrado' });
//   }
// };

// exports.signup = async (req, res, next) => {
exports.signup = async (req, res, next) => {
  // Si user no esta conectado, crear y hacer login a un nuevo usuario
  if (!req.user) {
    try {
      // Crear una nueva instancia del modelo 'User'
      const user = new User(req.body);
      // Configurar la propiedad user provider
      user.provider = "local";
      // Intenta salvar el documento user
      await user.save();

      // Generamos el token JWT después del registro exitoso
      const token = generateToken(user);

      // Configuramos los datos seguros del usuario para devolver
      const safeUser = getSafeUser(user);

      // const safeUser = {
      //   id: user._id,
      //   username: user.username,
      //   email: user.email,
      //   fullName: user.fullName
      // };

      // Devolvemos el token y los datos del usuario
      return res.status(201).json({
        message: 'Registro exitoso',
        token,
        user: safeUser
      });
    } catch (err) {
      // Si ocurre un error, obtenemos el mensaje de error
      const message = getErrorMessage(err);
      return res.status(400).json({ message: message, error: err });
    }
  } else {
    return res.status(403).json({ message: 'Usuario ya registrado' });
  }
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

// Middleware controller para autorizar operaciones basado en JWT
exports.requiresLogin = (req, res, next) => {
  // Verificar si existe un token en la solicitud
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;

  console.log('req: ', req);
  console.log('req.isAuthenticated(): ', req.isAuthenticated());

  if (!token) {
    return res.status(401).json({
      message: "Acceso no autorizado. Token no proporcionado.",
    });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar la información del usuario decodificada a la solicitud
    req.user = decoded;

    // Continuar con el siguiente middleware
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
      error: error.message
    });
  }
};

