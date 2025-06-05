const Producto = require('../models/Producto');
const UnidadMedida = require('../models/UnidadMedida');
const Almacen = require('../models/Almacen');
const { validationResult } = require('express-validator');

// List all Productos, populating 'unidad_medida' and 'almacen'
exports.list = async (req, res, next) => {
  try {
    const productos = await Producto.find().populate('unidad_medida').populate('almacen');
    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
};

// Get a single Producto by ID, populating 'unidad_medida' and 'almacen'
exports.get = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { // For ID validation from routes
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const producto = await Producto.findById(req.params.id).populate('unidad_medida').populate('almacen');
    if (!producto) {
      const error = new Error('Producto no encontrado.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
};

// Create a new Producto
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { codigo, descripcion, unidad_medida, almacen, stock_minimo } = req.body;

    // Check if UnidadMedida exists
    const umExists = await UnidadMedida.findById(unidad_medida);
    if (!umExists) {
      const error = new Error('La unidad de medida especificada no existe.');
      error.statusCode = 400;
      return next(error);
    }

    // Check if Almacen exists
    const almacenExists = await Almacen.findById(almacen);
    if (!almacenExists) {
      const error = new Error('El almacén especificado no existe.');
      error.statusCode = 400;
      return next(error);
    }

    const nuevoProducto = new Producto({
      codigo,
      descripcion,
      unidad_medida,
      almacen,
      stock_minimo
    });
    await nuevoProducto.save();
    // Populate references for the response
    const productoPoblado = await Producto.findById(nuevoProducto._id).populate('unidad_medida').populate('almacen');
    res.status(201).json(productoPoblado);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.codigo) {
        const err = new Error('El código de producto ya existe.');
        err.statusCode = 409; // Conflict
        return next(err);
    }
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Update an existing Producto by ID
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { codigo, descripcion, unidad_medida, almacen, stock_minimo } = req.body;
    const updateData = {};

    if (codigo) updateData.codigo = codigo;
    if (descripcion) updateData.descripcion = descripcion;
    if (stock_minimo !== undefined) updateData.stock_minimo = stock_minimo;


    if (unidad_medida) {
      const umExists = await UnidadMedida.findById(unidad_medida);
      if (!umExists) {
        const error = new Error('La unidad de medida especificada no existe.');
        error.statusCode = 400;
        return next(error);
      }
      updateData.unidad_medida = unidad_medida;
    }

    if (almacen) {
      const almacenExists = await Almacen.findById(almacen);
      if (!almacenExists) {
        const error = new Error('El almacén especificado no existe.');
        error.statusCode = 400;
        return next(error);
      }
      updateData.almacen = almacen;
    }

    const producto = await Producto.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('unidad_medida').populate('almacen');

    if (!producto) {
      const error = new Error('Producto no encontrado para actualizar.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(producto);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.codigo) {
        const err = new Error('El código de producto ya existe.');
        err.statusCode = 409; // Conflict
        return next(err);
    }
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Delete a Producto by ID
exports.remove = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { // For ID validation from routes
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      const error = new Error('Producto no encontrado para eliminar.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
