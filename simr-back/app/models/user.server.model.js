// Invocar el modo javascript 'strict'
'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	email: {
		required: true,
		unique: true,
		type: String,
		// Validación
		match: [/.+\@.+\..+/, "Escriba una dirección de correo válida"]
	},
	username: {
		type: String,
		required: true,
		// Configurar un único username
		unique: true,
		// Validar la existencia del valor 'username'
		trim: true
	},
	password: {
		type: String,
		required: true,
		// Validar el valor length de 'password'
		validate: [
			function (password) {
				return password && password.length > 6;
			}, 'La contraseña debe ser más larga'
		]
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		// Validar existencia del proveedor 'Provider'
		required: 'Provider is required'
	},
	providerId: String,
	providerData: {},
	created: {
		type: Date,
		// Crear un valor 'created' por defecto
		default: Date.now
	},
	refreshTokens: [{
		token: String,
		createdAt: { type: Date, default: Date.now },
		expiresAt: Date
	}]
});

// Configurar la propiedad virtual 'fullname'
UserSchema.virtual('fullName').get(function () {
	return this.firstName + ' ' + this.lastName;
}).set(function (fullName) {
	var splitName = fullName.split('');
	this.firstName = splitName[0] || '';
	this.lastName = splitName[1] || '';
});

// Usar un middleware pre-save para la contraseña
UserSchema.pre('save', async function (next) {
	console.log('Pre-save middleware triggered for user:', this.username);

	// Verificar si la contraseña ya fue hasheada manualmente
	if (this._skipHashing) {
        console.log('Saltando hashing (ya fue hasheada manualmente)');
        delete this._skipHashing;
        return next();
    }

	// Solo hashear si la contraseña fue modificada
	// if (!this.isModified('password')) return next();
	if (!this.isModified('password')) {
		console.log('Contraseña no modificada, saltando hashing para usuario:', this.username);
		return next();
	}

	try {
		console.log('(Pre-save) Hashing password for user:', this.username);
		// Generar salt y hashear la contraseña
		this.password = await this.hashPassword(this.password);
		next();
	} catch (error) {
		next(error);
	}
});

// Función para hacer Hashing a la Contraseña
UserSchema.methods.hashPassword = async (plainPassword) => {
	const saltRounds = 12;
	return await bcrypt.hash(plainPassword, saltRounds);
};

UserSchema.methods.isBcryptHash = function (hash) {
	console.log('Verificando hash:', hash);
	const bcryptRegex = /^\$2[abxy]\$\d{2}\$.{53}$/; // bcrypt tiene un formato específico: $2a$, $2b$, $2x$, $2y$
	return bcryptRegex.test(hash);
}

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Método híbrido para verificar la contraseña, migrando de pbkdf2 a bcrypt si es necesario
UserSchema.methods.verifyPassword = async function (candidatePassword) {
	console.log('Verifying password for user:', this.username, candidatePassword);
	if (this.isBcryptHash(this.password)) {
		// Contraseña en formato bcrypt
		console.log('Contraseña en formato bcrypt');
		return await bcrypt.compare(candidatePassword, this.password);
	} else {
		// Contraseña antigua en formato pbkdf2
		console.log('Contraseña en formato pbkdf2');
		if (!this.salt) return false; // Sin salt = inválido

		const hashed = crypto.pbkdf2Sync(candidatePassword, this.salt, 10000, 64, 'sha512').toString('base64');
		console.log('Contraseña hasheada:', hashed);
		const isMatch = hashed === this.password;

		// Si coincide, migrar automáticamente a bcrypt
		if (isMatch) {
			console.log('Las contraseñas coinciden, migrando a bcrypt');
			this.password = await this.hashPassword(candidatePassword);
			this.salt = undefined; // Ya no se necesita con bcrypt
			this._skipHashing = true; // Flag temporal para evitar rehashing
			await this.save(); // Persistir nueva contraseña
		}

		return isMatch;
	}
};

// Limpiar refresh tokens expirados
UserSchema.methods.cleanExpiredTokens = function () {
	this.refreshTokens = this.refreshTokens.filter(
		tokenObj => tokenObj.expiresAt > new Date()
	);
};

// Encontrar posibles username no usados
UserSchema.statics.findUniqueUserName = function (username, suffix, callback) {
	var _this = this;
	//Añadir un sufijo 'username'
	var possibleUsername = username + (suffix || '');
	//User el método 'findOne del model 'User' para encontrar un username 'unico disponible'
	_this.findOne({
		username: possibleUsername
	}, function (err, user) {
		if (!err) {
			//Si un username único disponible fue encontrado, llama al método callback
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUserName(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

// Configura el 'UserSchema' para usar getters y virtuals cuando se transforme a JSON
UserSchema.set('toJSON', {
	getters: true,
	virtuals: true
});


// Crear el modelo 'User' a partir del 'UserSchema'
mongoose.model('User', UserSchema);
