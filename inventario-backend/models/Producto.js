const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductoSchema = new Schema({
  codigo: { type: String, unique: true, required: true, trim: true },
  descripcion: { type: String, required: true },
  unidad_medida: { type: Schema.Types.ObjectId, ref: 'UnidadMedida', required: true },
  almacen: { type: Schema.Types.ObjectId, ref: 'Almacen', required: true },
  stock_minimo: { type: Number, required: true, min: [0, 'El stock mínimo no puede ser negativo'] }
}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);
