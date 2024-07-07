var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var DiccionariosSchema = mongoose.Schema({
  tabla:{
    type:String,
    trim:true
  },
  campo:{
    type:String,
    trim:true
  },
  campoLargo:{
    type:String,
    trim:true
  },
  definicion:{
    type:String,
    trim:true
  },
  creador:{
    type:Schema.ObjectId,
    ref:'User'
  },
  creado:{
    type:Date,
    default:Date.now
  }
});

DiccionariosSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Diccionario", DiccionariosSchema);
