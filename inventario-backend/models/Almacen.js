const mongoose = require('mongoose');
const { Schema } = mongoose;

const AlmacenSchema = new Schema({
  descripcion: { type: String, required: true },
  ubicacion: { type: String } // Optional as per initial spec
}, { timestamps: true });

module.exports = mongoose.model('Almacen', AlmacenSchema);
