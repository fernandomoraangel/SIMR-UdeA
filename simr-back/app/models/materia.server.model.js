var mongoose=require('mongoose'),
	Schema=mongoose.Schema;

	//Auditoría (borrado o edición de algún campo o registro completo)
	var registroOperacion=new Schema({
		tipoDeOperacion:{
			type:String,
			//A partir de lista
		},
		registroBorrado:{
			type:Boolean,
			default:false
		},
		campo:{
			//Uno o varios
		},
		fecha:{
			type:Date,
			default:Date.now
		},
		usuario:{
			type:Schema.ObjectId,
			ref:'User'
		}

	});

	var alias=new Schema({
		nombre:{
			type:String,
		},
	});	

	var descriptorLibre=new Schema({
		etiqueta:{
			type:String,
			trim:true,
			require:true
		},
		contenido:{
			type:String,
			require:true
		}
	});
		var MateriaRelacionada=new Schema({
			id:{
				type:Schema.ObjectId,
				ref:'Materia'
			}
	});

	var vinculoRelacionado=new Schema({
		etiqueta:{
		},
		url:{
		}
	});
	var MateriaSchema=new Schema({
		nombre:{
			type:String,
			trim:true,
			unique: true,
			require:true
		},
		alias:[alias],
		materiasRelacionadas:[MateriaRelacionada],
		padres:[MateriaRelacionada],
		hijos:[MateriaRelacionada],
		descripcion:{
			type:String,
		},
		descriptorLibre:[descriptorLibre],
		vinculoRelacionado:[vinculoRelacionado],
		creador:{
			type:Schema.ObjectId,
			ref:'User'
		},
		creado:{
			type:Date,
			default:Date.now
		},
		registroOperacion:[registroOperacion]

	});


MateriaSchema.set('toJSON', {
  getters: true,
  virtuals: true
});


	mongoose.model('Materia', MateriaSchema);

