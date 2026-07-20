"use strict";

const mongoose = require("mongoose");
const User = mongoose.model("User");
const passport = require("passport");
const logAudit = require("../services/audit.service").logAudit;
const {
  generateTokens,
  verifyRefreshToken,
  getTokenExpirationDate,
  getTokenExpirationInSeconds,
} = require("../../utils/tokenUtils");
const {
  successResponse,
  errorResponse,
  authSuccessResponse,
} = require("../../utils/responseHelpers");
const { cookieHelpers } = require("../../config/cookieConfig");
const e = require("express");

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
    return errorResponse(res, "Usuario ya conectado", 403);
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
      console.warn("Hubo problemas configurando las cookies");
    }

    // Devolvemos los datos del usuario y la info de token
    const safeUser = user.getSafeUser();
    const accessTokenExpiresIn = tokens.expiresIn;
    authSuccessResponse(
      res,
      "Usuario registrado exitosamente",
      201,
      safeUser,
      accessTokenExpiresIn
    );
  } catch (error) {
    console.error("Error en signup:", error);

    // Si ocurre un error, obtenemos el mensaje de error
    const message = getErrorMessage(error);
    errorResponse(res, message, 400, {
      error: error.message || "Error al registrar usuario",
    });
  }
};

//* LOGIN - Inicio de sesión
exports.login = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      console.log("LOGIN: passport.authenticate (backend) - user:", user);
      console.log("LOGIN: passport.authenticate (backend) - info:", info);

      if (err) {
        return errorResponse(res, "Error de autenticación", 500);
        // return next(err);
      }

      if (!user) {
        console.warn("LOGIN: Usuario no encontrado o credenciales inválidas");
        return errorResponse(
          res,
          info?.message || "Credenciales inválidas",
          401
        );
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
          expiresAt: getTokenExpirationDate(refreshToken),
        });

        await user.save();

        // Configurar cookies seguras
        const cookiesSaved = cookieHelpers.setAuthCookies(
          res,
          accessToken,
          refreshToken
        );

        if (!cookiesSaved) {
          console.warn("Hubo problemas configurando las cookies");
        }

        // Respuesta para el cliente
        const safeUser = user.getSafeUser();
        const tokenExpiresIn = getTokenExpirationInSeconds(accessToken);
        authSuccessResponse(
          res,
          "Autenticación exitosa",
          200,
          safeUser,
          tokenExpiresIn
        );
      } catch (error) {
        next(error);
      }
    }
  )(req, res, next);
};

//* REFRESH TOKEN - Actualización de tokens
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return errorResponse(res, "Refresh token no encontrado", 401);
  }

  try {
    // Verificar el refresh token
    const decoded = verifyRefreshToken(refreshToken);
    console.log("\x1b[35m(user.controller) REFRESHING TOKEN\x1b[0m");

    // console.log('(user.controller) REFRESH TOKEN: decoded:', decoded);
    if (!decoded) {
      return errorResponse(res, "Refresh token inválido", 401);
    }

    // Buscar usuario y verificar que el token existe
    const user = await User.findById(decoded.id).populate(
      "roles",
      "name displayName description priority"
    );

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 401);
    }

    // Limpiar refresh tokens expirados
    user.cleanExpiredTokens();

    // Verificar si el JTI existe en la base de datos, y extrae el token correspondiente
    const validToken = user.findValidRefreshToken(decoded.jti);

    // console.log("(user.controller) validToken:", validToken);

    if (!validToken) {
      return errorResponse(res, "Refresh token revocado o expirado", 403);
    }

    // Generar nuevos tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      jti: newJti,
    } = generateTokens(user._id);

    // Reemplazar el token anterior del campo refreshTokens del Usuario
    const rotationResult = user.rotateRefreshToken({
      oldJti: decoded.jti,
      newToken: newRefreshToken,
      newJti,
      newExpiresAt: getTokenExpirationDate(newRefreshToken),
      allowInsertIfMissing: false,
    });

    if (rotationResult === "not_found") {
      return errorResponse(res, "Refresh token no renovado", 403);
    }

    await user.save();

    // Actualizar cookies
    const cookiesUpdated = cookieHelpers.setAuthCookies(
      res,
      accessToken,
      newRefreshToken
    );

    if (!cookiesUpdated) {
      console.warn("Hubo problemas actualizando las cookies");
    }

    // Responder al cliente con info de token
    const accessTokenExpiresIn = getTokenExpirationInSeconds(accessToken);
    authSuccessResponse(
      res,
      "Token actualizado exitosamente",
      200,
      user.getSafeUser(),
      accessTokenExpiresIn
    );
  } catch (error) {
    console.error("Error al refrescar el token:", error);
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Refresh token expirado", 401);
    } else if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Refresh token inválido", 401);
    }

    // Error genérico
    console.error("Error al refrescar el token:", error);
    errorResponse(res, "Error interno del servidor", 500);
  }
};

//* VERIFY TOKEN - Verificar autenticación
exports.verifyToken = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    console.log("\x1b[35m(user.controller) VERIFYING TOKEN\x1b[0m");
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);
    console.log("Error:", err);
    console.log("User:", user ? user.username : "No user");
    console.log("Info:", info);

    if (err) {
      console.error("Error en verifyToken:", err);
      // No llamar next(err) para evitar el error 500
      return errorResponse(res, "Error interno del servidor", 500);
    }

    if (!user) {
      console.log("Token inválido o no encontrado");
      return errorResponse(res, "Token inválido o expirado", 401);
    }

    try {
      // Responder con el usuario seguro
      const safeUser = user.getSafeUser();

      // Verificar si hay accessToken en cookies
      let accessTokenExpiresIn = null;
      if (req.cookies && req.cookies.accessToken) {
        try {
          accessTokenExpiresIn = getTokenExpirationInSeconds(
            req.cookies.accessToken
          );
        } catch (tokenError) {
          console.log("Error al obtener expiración del token:", tokenError);
          accessTokenExpiresIn = 900; // valor por defecto
        }
      } else {
        console.log("No se encontró accessToken en cookies");
        accessTokenExpiresIn = 900; // valor por defecto
      }

      authSuccessResponse(
        res,
        "Token verificado exitosamente",
        200,
        safeUser,
        accessTokenExpiresIn
      );
    } catch (error) {
      console.error("Error al procesar respuesta de verificación:", error);
      return errorResponse(res, "Error interno del servidor", 500);
    }
  })(req, res, next);
};

//* LOGOUT - Cierre de sesión
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Verificar y decodificar el refresh token
      const decoded = verifyRefreshToken(refreshToken);

      console.log("(user.controller) LOGOUT: decoded:", decoded);

      // Remover refresh token de la base de datos
      if (decoded && decoded.id && decoded.jti) {
        // Buscar usuario y remover el refresh token por JTI
        const user = await User.findById(decoded.id);
        if (user && user.refreshTokens) {
          // Invalidar refreshtoken
          const wasTokenInvalidated = user.invalidateRefreshToken(decoded.jti);
          if (wasTokenInvalidated) {
            await user.save();
            console.log(
              `Token con JTI ${decoded.jti} eliminado para usuario ${user._id}`
            );
          } else {
            console.log(
              `Token con JTI ${decoded.jti} no encontrado para usuario ${user._id}`
            );
          }
        }
      } else {
        // Token inválido o expirado
        console.log("Token inválido o expirado durante logout");
      }
    }

    // Limpiar cookies
    const cookiesCleared = cookieHelpers.clearAuthCookies(res);

    if (!cookiesCleared) {
      console.warn("Hubo problemas limpiando las cookies");
    }

    // Responder al cliente
    successResponse(res, "Sesión cerrada exitosamente", 200);
  } catch (error) {
    console.error("Error durante logout:", error);

    // Aún limpiar cookies aunque haya error
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    errorResponse(
      res,
      "Error durante logout, pero sesión cerrada localmente",
      500
    );
  }
};

//* CREATE - Crear un nuevo usuario
exports.create = async (req, res, next) => {
  try {
    const user = await User.createUser(req.body);
    if (!user) {
      return errorResponse(res, "Error al crear usuario", 400);
    }

    console.log("Usuario creado:", user);
    successResponse(
      res,
      "Usuario creado exitosamente",
      201,
      user.getSafeUser()
    );
  } catch (err) {
    errorResponse(res, getErrorMessage(err), 400, {
      error: err.message || "Error al crear usuario",
    });
    // Llamar al siguiente middleware con un mensaje de error
    // return next(err);
  }
};

//* LIST - Recuperar una lista de usuarios
//* LIST - Recuperar una lista de usuarios
exports.list = async (req, res, next) => {
  try {
    // Usa el método static 'User' 'find' para recuperar la lista de usuarios
    // Populate roles para obtener los nombres completos en lugar de solo IDs
    const users = await User.find({})
      .populate("roles", "name displayName description priority")
      .select("-password"); // No enviar passwords

    // Usa el objeto 'response para enviar una respuesta JSON'
    successResponse(
      res,
      "Lista de usuarios recuperada exitosamente",
      200,
      users
    );
  } catch (err) {
    // Llama al siguiente middleware con un mensaje de error
    return next(err);
  }
};

//* READ - Recuperar un usuario específico
exports.read = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    console.log("Recuperando usuario con ID:", req.requestedUser._id);
    console.log("firstName:", req.requestedUser.firstName);
    console.log("lastName:", req.requestedUser.lastName);

    await req.requestedUser.populate("roles", "name displayName description priority");

    const safeUser = req.requestedUser.getSafeUser();

    console.log(
      "Usuario recuperado (safeUser):",
      JSON.stringify(safeUser, null, 2)
    );

    return successResponse(
      res,
      "Usuario recuperado exitosamente",
      200,
      safeUser
    );
  } catch (err) {
    console.error("Error al recuperar el usuario:", err);
    return errorResponse(res, "Error al recuperar el usuario", 500, {
      error: err.message || "Error interno del servidor",
    });
  }
};

//* UPDATE - Actualizar un usuario específico
exports.update = async (req, res, next) => {
  try {
    // Obtener el ID del usuario a actualizar desde req.requestedUser (establecido por userByID middleware)
    const userId = req.requestedUser._id;

    // Filtrar campos permitidos para actualización
    const allowedFields = ["email", "firstName", "lastName", "password"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    });

    // Si se proporcionó password, hashear antes de guardar
    if (updateData.password) {
      const user = await User.findById(userId);
      user.password = updateData.password;
      await user.save(); // Esto dispara el pre-save hook que hashea el password
      delete updateData.password; // Ya fue actualizado
    }

    // Actualizar otros campos
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    // Usa el objeto 'response para enviar una respuesta JSON'
    successResponse(
      res,
      "Usuario actualizado exitosamente",
      200,
      user.getSafeUser()
    );
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    return errorResponse(res, getErrorMessage(err), 400, {
      error: err.message || "Error al actualizar usuario",
    });
  }
};

//* DELETE - Eliminar un usuario específico
exports.delete = async (req, res, next) => {
  try {
    // Verificar que no se esté eliminando a sí mismo
    if (req.requestedUser._id.toString() === req.user._id.toString()) {
      return errorResponse(res, "No puedes eliminar tu propia cuenta", 400);
    }

    const userId = req.requestedUser._id;
    const transferTo = req.body && req.body.transferTo ? req.body.transferTo : null;

    if (transferTo) {
      if (transferTo.toString() === userId.toString()) {
        return errorResponse(
          res,
          "El usuario destino de la reasignación no puede ser el mismo que se elimina",
          400
        );
      }

      const target = await User.findById(transferTo);
      if (!target || !target.isActive) {
        return errorResponse(
          res,
          "El usuario destino de la reasignación no existe o está inactivo",
          400
        );
      }

      // Reasignar la propiedad (campo `creador`) en todas las colecciones que lo usen
      const modelNames = mongoose.modelNames();
      let reassigned = 0;
      for (const name of modelNames) {
        const Model = mongoose.model(name);
        if (!Model.schema || !Model.schema.path("creador")) continue;
        const result = await Model.updateMany(
          { creador: userId },
          { $set: { creador: transferTo } }
        );
        reassigned += result.modifiedCount || 0;
      }

      await logAudit(req, "user_deleted", "user", userId, {
        deletedUser: {
          username: req.requestedUser.username,
          email: req.requestedUser.email,
        },
        transferTo,
        reassignedDocuments: reassigned,
      });
    } else {
      // Sin reasignación: registrar la eliminación tal cual
      await logAudit(req, "user_deleted", "user", userId, {
        deletedUser: {
          username: req.requestedUser.username,
          email: req.requestedUser.email,
        },
      });
    }

    // Usamos el método 'deleteOne' de la instancia 'User' para eliminar un documento
    await req.requestedUser.deleteOne();
    successResponse(res, "Usuario eliminado exitosamente", 200);
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    return errorResponse(res, "Error al eliminar usuario", 500, {
      error: err.message || "Error interno del servidor",
    });
  }
};

//* USER BY ID - Middleware para recuperar un usuario por ID
exports.userByID = async (req, res, next, id) => {
  try {
    console.log("Entrando al middleware userByID con ID:", id);
    const user = await User.findOne({ _id: id });
    if (!user) {
      return next(new Error("Error al cargar usuario " + id));
    }

    console.log("(userByID) Usuario encontrado:", user);
    // Configura la propiedad ´req.user'
    req.requestedUser = user;
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
      messages: ["Credenciales inválidas"],
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
      messages: ["Error al registrar usuario"],
    });
  } else {
    return res.redirect("/");
  }
};

// Controller para Google OAuth con JWT
exports.googleCallback = (req, res) => {
  // Después de la autenticación exitosa con Google
  return null;
};

//* REQUIRES LOGIN - Middleware controller para autorizar operaciones basado en JWT
exports.requiresLogin = (req, res, next) => {
  console.log("Entrando al middleware requiresLogin...");

  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return errorResponse(
        res,
        "Acceso no autorizado. Token inválido o expirado",
        401
      );
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
    return errorResponse(res, "Usuario no autorizado", 403);
  }
  // Llamar sgte middleware
  next();
};
