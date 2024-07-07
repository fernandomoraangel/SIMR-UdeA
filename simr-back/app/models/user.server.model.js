//Invocar el modo javascript 'strict'
'use strict';

//Cargar dependencias de los módulos

var mongoose=require('mongoose'),
	crypto=require('crypto'),
	Schema=mongoose.Schema;

//Definir un nuevo 'UseSchema'

var UserSchema=new Schema({
	firstName:String,
	lastName: String,
	email:{
		type: String,
	//Validación
match:[/.+\@.+\..+/,"Escriba una dirección de correo válida"]
},
	username:{
		type:String,
		//Configurar un único username
		unique:true,
		//Validar la existencia del valor 'username'
		trim:true
	},
	password:{
		type: String,
		//Validar el valor length de 'password'
		validate:[
		function(password){
			return password && password.length >6;
		},'La contraseña debe ser más larga'
		]
	},
	salt:{
		type:String
	},
	provider:{
		type:String,
		//Validar existencia del proveedor 'Provider'
		required:'Provider is required'
	},
	providerId:String,
	providerData:{},
	created:{
		type:Date,
		//Crear un valor 'created' por defecto
		default:Date.now
	}
});
//Configurar la propiedad virtual 'fullname'
UserSchema.virtual('fullName').get(function(){
	return this.firstName+' '+this.lastName;
}).set(function(fullName){
	var splitName=fullName.split('');
	this.firstName=splitName[0]||'';
	this.lastName=splitName[1]||'';
});




//Usar un middleware pre-save para la contraseña
UserSchema.pre('save',function(next){
	if(this.password){
		this.salt=new Buffer.from(crypto.randomBytes(16).toString('base64'));
		this.password=this.hashPassword(this.password);
		//console.log(this.password+" Password save")
	}
	next();
});

//Crear un método instancia para hashing una contraseña
UserSchema.methods.hashPassword=function(password){
	//console.log(crypto.pbkdf2Sync(this.password,this.salt,10000,64,'sha512').toString('base64')+" hashPassword");
	return crypto.pbkdf2Sync(password,this.salt,10000,64,'sha512').toString('base64');
};



//Crear un método instancia para autenticar el usuario
UserSchema.methods.authenticate=function(password){
	//console.log(password+" password");
	//console.log(this.hashPassword(password)+" hashPassword");
	return this.password==this.hashPassword(password);
};

//Encontrar posibles username no usados
UserSchema.statics.findUniqueUserName=function(username,suffix,callback){
	var _this=this;
	//Añadir un sufijo 'username'
	var possibleUsername=username+(suffix ||'');
	//User el método 'findOne del model 'User' para encontrar un username 'unico disponible'
	_this.findOne({
		Username:possibleUsername
	},function(err,user){
		if(!err){
			//Si un username único disponible fue encontrado, llama al método callback
			if(!user){
				callback(possibleUsername);
			}else{
				return _this.findUniqueUserName(username,(suffix || 0)+1,callback);
			}
		}else{
		callback(null);
		}
	});
};
//Configura el 'UserSchema' para usar getters y virtuals cuando se transforme a JSON
UserSchema.set('toJSON', {
  getters: true,
  virtuals: true
});


//Crear el modelo 'User' a partir del 'UserSchema'
mongoose.model('User',UserSchema);
