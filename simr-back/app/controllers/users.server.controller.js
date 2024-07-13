//Invocar el modo 'strict' de Javascript
"use Strict";

// Cargar el model Mongoose 'User'
const User = require("mongoose").model("User");
const passport = require("passport");

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

// Controller que renderiza la página signin
exports.renderSignin = (req, res, next) => {
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
exports.renderSignup = (req, res, next) => {
  // Si el usuario no está conectado, renderizar la página signin, en otro caso, redireccionar al usuario
  if (!req.user) {
    // Usa el objeto 'response' para renderizar la página
    res.render("signup", {
      title: "Página de registro",
      // Configura la variable para el mensaje flash
      messages: req.flash("error"),
    });
  } else {
    return res.redirect("/idiomas");
  }
};

// Controller para signin
exports.signin = (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const safeUser = {
        id: user._id,
        username: user.username,
        email: user.email,
        // agrega otros campos que quieras exponer
      };
      res.json({ message: 'Authentication successful', user: safeUser });
    });
  })(req, res, next);
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
exports.signout = (req, res, next) => {
  // Usa el método logout de passport con respectivo callback para salir
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // Redirecciona al usuario de vuelta a la página principal
    res.redirect('/');
  });
};

// Controller para crear nuevo usuario
exports.signup = async (req, res, next) => {
  // Si user no esta conectado, crear y hacer login a un nuevo usuario
  if (!req.user) {
    try {
      // Crear una nueva instancia del modelo 'User'
      // console.log(req.body);
      const user = new User(req.body);
      // Configurar la propiedad user provider
      user.provider = "local";
      // Intenta salvar el documento user
      await user.save();
      req.login(user, function (err) {
        // Si ocurre error de login moverse al siguiente middleware
        if (err) return next(err);
        // Redirecciona de nuevo a la página principal
        // return res.redirect("/");
        // return res.status(200).json({ message: 'Registro exitoso', user });
        const { _id, username, email } = user;
        return res.status(200).json({ message: 'Registro exitoso', user: { _id, username, email } });
      });
    } catch (err) {
      // Si ocurre un error, lo reporta usando el mensaje flash
      // Usa el método de manejo de errores para obtener el error
      const message = getErrorMessage(err);
      // Configura los mensajes flash
      req.flash("error", message);
      // Redirecciona al usuario de vuelta a signup
      // return res.redirect("/signup");
      return res.status(500).json({ message: 'Error en el registro', err });
    }
  } else {
    // return res.redirect("/");
    // return res.status(200).json({ message: 'Registro exitoso', user });
    // return res.status(200).json({ message: 'Registro exitoso', user: { id, username, email } });
    return res.status(405).send({ message: 'Usuario ya registrado' });
  }
};

// Middleware controller para autorizar operaciones
exports.requiresLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({
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