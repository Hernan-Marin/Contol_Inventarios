const mongoose = require('mongoose');
const { Schema } = mongoose;

const RegistroSchema = new Schema({
  fecha: { type: Date, required: true, default: Date.now },
  tipo: { type: String, enum: ["entrada", "salida"], required: true },
  almacen: { type: Schema.Types.ObjectId, ref: 'Almacen', required: true },
  codigo_articulo: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  codigo_proveedor: { type: Schema.Types.ObjectId, ref: 'Contacto' }, // Conditionally required
  unidad_medida: { type: Schema.Types.ObjectId, ref: 'UnidadMedida', required: true },
  entregado_a: { type: Schema.Types.ObjectId, ref: 'Contacto' }, // Conditionally required
  observaciones: { type: String }
}, { timestamps: true });

// Pre-save hook for conditional validation
RegistroSchema.pre('save', async function(next) {
  if (this.tipo === 'entrada') {
    if (!this.codigo_proveedor) {
      return next(new Error('El campo "codigo_proveedor" es obligatorio para registros de tipo "entrada".'));
    }
    // Validate that the referenced contact is a 'proveedor'
    const proveedor = await mongoose.model('Contacto').findById(this.codigo_proveedor);
    if (!proveedor || proveedor.tipo !== 'proveedor') {
      return next(new Error('El contacto especificado en "codigo_proveedor" debe ser de tipo "proveedor".'));
    }
    this.entregado_a = undefined; // Ensure entregado_a is not set for 'entrada'
  } else if (this.tipo === 'salida') {
    if (!this.entregado_a) {
      return next(new Error('El campo "entregado_a" es obligatorio para registros de tipo "salida".'));
    }
    // Validate that the referenced contact is a 'cliente'
    const cliente = await mongoose.model('Contacto').findById(this.entregado_a);
    if (!cliente || cliente.tipo !== 'cliente') {
      return next(new Error('El contacto especificado en "entregado_a" debe ser de tipo "cliente".'));
    }
    this.codigo_proveedor = undefined; // Ensure codigo_proveedor is not set for 'salida'
  }
  next();
});

module.exports = mongoose.model('Registro', RegistroSchema);
