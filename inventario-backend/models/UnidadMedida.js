const mongoose = require('mongoose');
const { Schema } = mongoose;

const UnidadMedidaSchema = new Schema({
  categoria: { type: String, required: true },
  udm: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('UnidadMedida', UnidadMedidaSchema);
