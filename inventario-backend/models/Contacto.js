const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContactoSchema = new Schema({
  tipo: { type: String, enum: ["cliente", "proveedor"], required: true },
  identificacion: { type: String, unique: true, required: true },
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String }, // Optional as per initial spec
  correo_electronico: { // Optional, with email validation
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo electrónico válido']
  }
}, { timestamps: true });

module.exports = mongoose.model('Contacto', ContactoSchema);
