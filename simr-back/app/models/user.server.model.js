// Invocar el modo javascript 'strict'
"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  generateTokens,
  getTokenExpirationDate,
  getTokenExpirationInSeconds,
} = require("../../utils/tokenUtils");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    required: true,
    // TODO: Para que funcione único email, primero se deben eliminar emails duplicados de la BD
    // unique: true,
    type: String,
    // Validación
    match: [/.+\@.+\..+/, "Escriba una dirección de correo válida"],
  },
  username: {
    type: String,
    required: true,
    // Configurar un único username
    unique: true,
    // Validar la existencia del valor 'username'
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // Validar el valor length de 'password'
    validate: [
      function (password) {
        return password && password.length > 6;
      },
      "La contraseña debe ser más larga",
    ],
  },
  salt: {
    type: String,
  },
  provider: {
    type: String,
    // Validar existencia del proveedor 'Provider'
    required: "Provider is required",
  },
  providerId: String,
  providerData: {},
  created: {
    type: Date,
    // Crear un valor 'created' por defecto
    default: Date.now,
  },
  refreshTokens: [
    {
      token: String,
      jti: String, // Identificador único del token
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
    },
  ],
  // Sistema de roles y permisos
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  customPermissions: [
    {
      resource: String,
      action: String,
      scope: { type: String, enum: ["any", "own"], default: "own" },
    },
  ],
});

// Configurar la propiedad virtual 'fullname'
UserSchema.virtual("fullName")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (fullName) {
    var splitName = fullName.split("");
    this.firstName = splitName[0] || "";
    this.lastName = splitName[1] || "";
  });

// Usar un middleware pre-save para la contraseña
UserSchema.pre("save", async function (next) {
  console.log("Pre-save middleware triggered for user:", this.username);

  // Verificar si la contraseña ya fue hasheada manualmente
  if (this._skipHashing) {
    console.log("Saltando hashing (ya fue hasheada manualmente)");
    delete this._skipHashing;
    return next();
  }

  // Solo hashear si la contraseña fue modificada
  // if (!this.isModified('password')) return next();
  if (!this.isModified("password")) {
    console.log(
      "Contraseña no modificada, saltando hashing para usuario:",
      this.username
    );
    return next();
  }

  try {
    console.log("(Pre-save) Hashing password for user:", this.username);
    // Generar salt y hashear la contraseña
    this.password = await this.hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

//* GET SAFE USER - Método para devolver un objeto de usuario seguro (sin contraseña)
UserSchema.methods.getSafeUser = function () {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    firstName: this.firstName || "",
    lastName: this.lastName || "",
    fullName: `${this.firstName} ${this.lastName}`.trim(),
    roles: this.roles || [],
  };
};

//* HASH PASSWORD - Función para hacer Hashing a la Contraseña
UserSchema.methods.hashPassword = async function (plainPassword) {
  const saltRounds = 12;
  return await bcrypt.hash(plainPassword, saltRounds);
};

//* IS BCRYPT HASH - Método para verificar si la contraseña está en formato bcrypt
UserSchema.methods.isBcryptHash = function (hash) {
  console.log("Verificando hash:", hash);
  const bcryptRegex = /^\$2[abxy]\$\d{2}\$.{53}$/; // bcrypt tiene un formato específico: $2a$, $2b$, $2x$, $2y$
  return bcryptRegex.test(hash);
};

//* COMPARE PASSWORD - Método para comparar contraseñas (solo para bcrypt)
// UserSchema.methods.comparePassword = async function (candidatePassword) {
// 	return await bcrypt.compare(candidatePassword, this.password);
// };

//* VERIFY PASSWORD - Método híbrido para verificar la contraseña, migrando de pbkdf2 a bcrypt si es necesario
UserSchema.methods.verifyPassword = async function (candidatePassword) {
  console.log("Verifying password for user:", this.username, candidatePassword);
  if (this.isBcryptHash(this.password)) {
    // Contraseña en formato bcrypt
    console.log("Contraseña en formato bcrypt");
    return await bcrypt.compare(candidatePassword, this.password);
  } else {
    // Contraseña antigua en formato pbkdf2
    console.log("Contraseña en formato pbkdf2");
    if (!this.salt) return false; // Sin salt = inválido

    const hashed = crypto
      .pbkdf2Sync(candidatePassword, this.salt, 10000, 64, "sha512")
      .toString("base64");
    console.log("Contraseña hasheada:", hashed);
    const isMatch = hashed === this.password;

    // Si coincide, migrar automáticamente a bcrypt
    if (isMatch) {
      console.log("Las contraseñas coinciden, migrando a bcrypt");
      this.password = await this.hashPassword(candidatePassword);
      this.salt = undefined; // Ya no se necesita con bcrypt
      this._skipHashing = true; // Flag temporal para evitar rehashing
      await this.save(); // Persistir nueva contraseña
    }

    return isMatch;
  }
};

//* CREATE USER - Método estático para crear un usuario (sin tokens)
UserSchema.statics.createUser = async function (userData) {
  try {
    const User = this;
    const user = new User(userData);
    user.provider = "local";

    // Guardar usuario
    await user.save();

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

//* CREATE USER WITH TOKENS - Método estático para crear usuario con tokens (Access y Refresh)
UserSchema.statics.createUserWithTokens = async function (userData) {
  try {
    const User = this;
    const user = new User(userData);
    user.provider = "local";

    // Generar tokens
    const { accessToken, refreshToken, jti } = generateTokens(user._id);

    // Agregar refresh token al usuario
    user.addRefreshToken({
      token: refreshToken,
      jti,
      expiresAt: getTokenExpirationDate(refreshToken),
    });

    // Guardar usuario
    await user.save();

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: getTokenExpirationInSeconds(accessToken),
      },
    };
  } catch (error) {
    console.error("Error creating user with tokens:", error);
    throw error;
  }
};

//* FIND VALID REFRESH TOKEN - Devolver el refresh token válido
UserSchema.methods.findValidRefreshToken = function (jti) {
  return this.refreshTokens.find(
    (token) => token.jti === jti && token.expiresAt > new Date()
  );
};

//* ADD REFRESH TOKEN - Agregar nuevo token
UserSchema.methods.addRefreshToken = function ({ token, jti, expiresAt }) {
  this.refreshTokens.push({
    token,
    jti,
    expiresAt,
  });
};

//* ROTATE REFRESH TOKEN - Rotar refresh token (renovar)
UserSchema.methods.rotateRefreshToken = function ({
  oldJti,
  newToken,
  newJti,
  newExpiresAt,
  allowInsertIfMissing = false,
}) {
  const index = this.refreshTokens.findIndex((token) => token.jti === oldJti);
  if (index !== -1) {
    this.refreshTokens[index] = {
      token: newToken,
      jti: newJti,
      expiresAt: newExpiresAt,
      createdAt: new Date(),
    };
    return "replaced";
  }

  // Si no se encuentra el token viejo, puedes agregar el nuevo (si 'allowInsertIfMissing' es verdadero)
  if (allowInsertIfMissing) {
    this.refreshTokens.push({
      token: newToken,
      jti: newJti,
      expiresAt: newExpiresAt,
      createdAt: new Date(),
    });
    return "inserted";
  }

  return "not_found";
};

//* CLEAN EXPIRED TOKENS -  Limpiar refresh tokens expirados
UserSchema.methods.cleanExpiredTokens = function () {
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj) => tokenObj.expiresAt > new Date()
  );
};

//* INVALIDATE TOKENS - Invalidar un refresh token específico
UserSchema.methods.invalidateRefreshToken = function (jti) {
  let wasInvalidated = false;
  const initialLength = this.refreshTokens.length;

  this.refreshTokens = this.refreshTokens.filter((token) => token.jti !== jti);

  if (this.refreshTokens.length < initialLength) {
    wasInvalidated = true;
  }

  return wasInvalidated;
};

//* INVALIDATE ALL REFRESH TOKENS - Invalidar todos los tokens (para logout completo)
UserSchema.methods.invalidateAllRefreshTokens = function () {
  this.refreshTokens = [];
};

//* GET ALL PERMISSIONS - Obtener todos los permisos del usuario (roles + custom)
UserSchema.methods.getAllPermissions = async function () {
  await this.populate("roles");
  const permissions = new Map();

  // Permisos de roles (con herencia)
  for (const role of this.roles || []) {
    const rolePerms = await role.getAllPermissions(); // Retorna Array
    for (const perm of rolePerms) {
      const key = `${perm.resource}:${perm.action}`;
      // Si ya existe el permiso, usar el scope más permisivo
      const existing = permissions.get(key);
      if (!existing || (existing === "own" && perm.scope === "any")) {
        permissions.set(key, perm.scope);
      }
    }
  }

  // Permisos custom del usuario (mayor prioridad)
  for (const perm of this.customPermissions || []) {
    const key = `${perm.resource}:${perm.action}`;
    permissions.set(key, perm.scope);
  }

  return permissions;
};

//* HAS PERMISSION - Verificar si el usuario tiene un permiso específico
UserSchema.methods.hasPermission = async function (
  resource,
  action,
  scope = "own"
) {
  const permissions = await this.getAllPermissions();
  const key = `${resource}:${action}`;
  const userScope = permissions.get(key);

  if (!userScope) return false;
  if (scope === "own") return true; // own o any son válidos
  return userScope === "any"; // para scope 'any', debe tener 'any'
};

//* HAS ROLE - Verificar si el usuario tiene un rol específico
UserSchema.methods.hasRole = async function (roleName) {
  await this.populate("roles");
  return this.roles.some((role) => role.name === roleName);
};

//* IS ADMIN - Verificar si el usuario es administrador
UserSchema.methods.isAdmin = async function () {
  return await this.hasRole("admin");
};

//* FIND UNIQUE USERNAME - Encontrar posibles username no usados
UserSchema.statics.findUniqueUserName = function (username, suffix, callback) {
  var _this = this;
  //Añadir un sufijo 'username'
  var possibleUsername = username + (suffix || "");
  //User el método 'findOne del model 'User' para encontrar un username 'unico disponible'
  _this.findOne(
    {
      username: possibleUsername,
    },
    function (err, user) {
      if (!err) {
        //Si un username único disponible fue encontrado, llama al método callback
        if (!user) {
          callback(possibleUsername);
        } else {
          return _this.findUniqueUserName(
            username,
            (suffix || 0) + 1,
            callback
          );
        }
      } else {
        callback(null);
      }
    }
  );
};

// Configura el 'UserSchema' para usar getters y virtuals cuando se transforme a JSON
UserSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

// Crear el modelo 'User' a partir del 'UserSchema'
mongoose.model("User", UserSchema);
