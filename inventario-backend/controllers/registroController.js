const Registro = require('../models/Registro');
const Producto = require('../models/Producto');
const Almacen = require('../models/Almacen');
const UnidadMedida = require('../models/UnidadMedida');
const Contacto = require('../models/Contacto');
const { validationResult } = require('express-validator');

const populateFields = [
    { path: 'almacen', select: 'descripcion ubicacion' },
    { path: 'codigo_articulo', select: 'codigo descripcion unidad_medida stock_minimo' },
    { path: 'unidad_medida', select: 'categoria udm' },
    { path: 'codigo_proveedor', select: 'nombre tipo identificacion' },
    { path: 'entregado_a', select: 'nombre tipo identificacion' }
];

// List all Registros
exports.list = async (req, res, next) => {
  try {
    const registros = await Registro.find().populate(populateFields);
    res.status(200).json(registros);
  } catch (error) {
    next(error);
  }
};

// Get a single Registro by ID
exports.get = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const registro = await Registro.findById(req.params.id).populate(populateFields);
    if (!registro) {
      const error = new Error('Registro no encontrado.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(registro);
  } catch (error) {
    next(error);
  }
};

// Create a new Registro
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { tipo, almacen, codigo_articulo, unidad_medida, codigo_proveedor, entregado_a } = req.body;

    // Check existence of main references
    const [almacenExists, productoExists, umExists] = await Promise.all([
        Almacen.findById(almacen),
        Producto.findById(codigo_articulo),
        UnidadMedida.findById(unidad_medida)
    ]);

    if (!almacenExists) {
        const error = new Error('El almacén especificado no existe.');
        error.statusCode = 400;
        return next(error);
    }
    if (!productoExists) {
        const error = new Error('El producto especificado no existe.');
        error.statusCode = 400;
        return next(error);
    }
    if (!umExists) {
        const error = new Error('La unidad de medida especificada no existe.');
        error.statusCode = 400;
        return next(error);
    }

    // Check conditional references if provided (Model hook will validate type and mandatory nature)
    if (tipo === 'entrada' && codigo_proveedor) {
        const proveedorExists = await Contacto.findById(codigo_proveedor);
        if (!proveedorExists) {
            const error = new Error('El proveedor especificado no existe.');
            error.statusCode = 400;
            return next(error);
        }
    } else if (tipo === 'salida' && entregado_a) {
        const clienteExists = await Contacto.findById(entregado_a);
        if (!clienteExists) {
            const error = new Error('El contacto (entregado a) especificado no existe.');
            error.statusCode = 400;
            return next(error);
        }
    }

    const nuevoRegistro = new Registro(req.body);
    await nuevoRegistro.save(); // Mongoose pre-save hook will run here

    const registroPopulado = await Registro.findById(nuevoRegistro._id).populate(populateFields);
    res.status(201).json(registroPopulado);
  } catch (error) {
    // Handle errors from pre-save hook or other issues
     if (error.name === 'ValidationError' || (error.message && (error.message.includes('obligatorio') || error.message.includes('debe ser de tipo')))) {
        const err = new Error(error.message);
        err.statusCode = 400;
        return next(err);
    }
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    next(error);
  }
};

// Update an existing Registro by ID
// For simplicity, this update is basic. More complex logic might be needed for changing 'tipo'
// or for specific field updates that have cascading effects.
// The pre-save hook in the model will still apply for conditional logic if relevant fields are updated.
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { tipo, almacen, codigo_articulo, unidad_medida, codigo_proveedor, entregado_a } = req.body;
    const updateData = { ...req.body };


    // Validate existence of references if they are being updated
    if (almacen) {
        const almacenExists = await Almacen.findById(almacen);
        if (!almacenExists) return res.status(400).json({ message: 'El almacén especificado no existe.' });
    }
    if (codigo_articulo) {
        const productoExists = await Producto.findById(codigo_articulo);
        if (!productoExists) return res.status(400).json({ message: 'El producto especificado no existe.' });
    }
    if (unidad_medida) {
        const umExists = await UnidadMedida.findById(unidad_medida);
        if (!umExists) return res.status(400).json({ message: 'La unidad de medida especificada no existe.' });
    }
    if (tipo === 'entrada' && codigo_proveedor) {
        const proveedorExists = await Contacto.findById(codigo_proveedor);
        if (!proveedorExists) return res.status(400).json({ message: 'El proveedor especificado no existe.' });
    } else if (tipo === 'salida' && entregado_a) {
        const clienteExists = await Contacto.findById(entregado_a);
        if (!clienteExists) return res.status(400).json({ message: 'El contacto (entregado a) especificado no existe.' });
    }


    // Note: The pre-save hook in the Registro model will run upon saving.
    // If 'tipo' is changed, it will enforce the rules for 'codigo_proveedor' and 'entregado_a'.
    const registroExistente = await Registro.findById(req.params.id);
    if (!registroExistente) {
        const error = new Error('Registro no encontrado para actualizar.');
        error.statusCode = 404;
        return next(error);
    }

    // Apply updates
    Object.assign(registroExistente, updateData);
    await registroExistente.save();

    const registroPopulado = await Registro.findById(registroExistente._id).populate(populateFields);
    res.status(200).json(registroPopulado);

  } catch (error) {
    if (error.name === 'ValidationError' || (error.message && (error.message.includes('obligatorio') || error.message.includes('debe ser de tipo')))) {
        const err = new Error(error.message);
        err.statusCode = 400;
        return next(err);
    }
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    next(error);
  }
};

// Delete a Registro by ID
exports.remove = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const registro = await Registro.findByIdAndDelete(req.params.id);
    if (!registro) {
      const error = new Error('Registro no encontrado para eliminar.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: 'Registro eliminado correctamente.' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
