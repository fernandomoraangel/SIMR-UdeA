//Invocar el modo 'strict' de Javascript
"use Strict";
//Cargar el model Mongoose 'User'
var User = require("mongoose").model("User");
passport = require("passport");

// Crear un nuevo método controler 'create'
exports.create = async function (req, res, next) {
  try {
    // Crear una nueva instancia del model Mongoose 'User', que se puebla usando la petición body del request
    var user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    // Llamar al siguiente middleware con un mensaje de error
    return next(err);
  }
};

// Crear un nuevo método controller 'list'
exports.list = async function (req, res, next) {
  try {
    // Usa el método static 'User' 'find' para recuperar la lista de usuarios
    // 'username email',{skip: 10, limit: 10}
    var users = await User.find({});
    // Usa el objeto 'response para enviar una respuesta JSON'
    res.json(users);
  } catch (err) {
    // Llama al siguiente middleware con un mensaje de error
    return next(err);
  }
};

exports.read = function (req, res) {
  // Usa el objeto 'response' para enviar una respuesta JSON
  res.json(req.user);
};

exports.update = async function (req, res, next) {
  try {
    // Usa el método static 'findByIdAndUpdate' de 'User' para actualizar
    var user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    // Usa el objeto 'response para enviar una respuesta JSON'
    res.json(user);
  } catch (err) {
    // Llama al sgte middleware
    return next(err);
  }
};

exports.delete = async function (req, res, next) {
  try {
    // Usamos el método 'remove' de la instancia 'User' para eliminar un dcto
    await req.user.remove();
    res.json(req.user);
  } catch (err) {
    return next(err);
  }
};

exports.userByID = async function (req, res, next, id) {
  try {
    // Usa el método static 'findOne' de 'User' para recuperar un usuario específico
    var user = await User.findOne({ _id: id });
    if (!user) {
      return next(new Error("Failed to load user " + id));
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
var getErrorMessage = function (err) {
  // Definir variable de error message
  var message = "";
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
    for (var errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  // Devolver el mensaje de error
  return message;
};

// Controller que renderiza la página signin
exports.renderSignin = function (req, res, next) {
  // Si el usuario no está conectado, renderizar signin, en otro caso redireccionar al usuario
  if (!req.user) {
    // Usa el objeto 'response' para renderizar la página
    res.render("signin", {
      // Reconfigurar la variable title de la página
      title: "Página de registro",
      // Configurar la variable del mensaje flash
      messages: req.flash("error") || req.flash("info"),
    });
  } else {
    return res.redirect("/");
  }
};

// Controller que renderiza la página signup
exports.renderSignup = function (req, res, next) {
  // Si el usuario no está conectado, renderizar la página signin, en otro caso, redireccionar al usuario
  if (!req.user) {
    // Usa el objeto 'response' para renderizar la página
    res.render("signup", {
      title: "Página de registro",
      // Configura la variable para el mensaje flash
      messages: req.flash("error"),
    });
  } else {
    return res.redirect("/");
  }
};

// Controller para signout
exports.signout = function (req, res, next) {
  // Usa el método logout de passport con respectivo callback para salir
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // Redirecciona al usuario de vuelta a la página principal
    res.redirect('/');
  });
};

// Controller para crear nuevo usuario
exports.signup = async function (req, res, next) {
  // Si user no est{a conectado, crear y hacer login a un nuevo usuario}
  if (!req.user) {
    try {
      // Crear una nueva instancia del modelo 'User'
      // console.log(req.body);
      var user = new User(req.body);
      // Configurar la propiedad user provider
      user.provider = "local";
      // Intenta salvar el documento user
      await user.save();
      req.login(user, function (err) {
        // Si ocurre error de login moverse al siguiente middleware
        if (err) return next(err);
        // Redirecciona de nuevo a la página principal
        return res.redirect("/");
      });
    } catch (err) {
      // Si ocurre un error, lo reporta usando el mensaje flash
      // Usa el método de manejo de errores para obtener el error
      var message = getErrorMessage(err);
      // Configura los mensajes flash
      req.flash("error", message);
      // Redirecciona al usuario de vuelta a signup
      return res.redirect("/signup");
    }
  } else {
    return res.redirect("/");
  }
};

// Middleware controller para autorizar operaciones
exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(302).send({
      message: "Usuario no autorizado",
      redirect: "/",
    });
  }
  // Llamar siguiente middleware
  next();
};

/* if (err) {
        // Usa el método de manejo de errores para obtener el error
        var message = getErrorMessage(err);
        // Configura los mensajes flash
        req.flash("error", message);
        // Redirecciona al usuario de vuelta a signup
        return res.redirect("/signup");
      } */