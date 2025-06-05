const Almacen = require('../models/Almacen');
const { validationResult } = require('express-validator');

// List all Almacenes
exports.list = async (req, res, next) => {
  try {
    const almacenes = await Almacen.find();
    res.json(almacenes);
  } catch (error) {
    next(error);
  }
};

// Get a single Almacen by ID
exports.get = async (req, res, next) => {
  try {
    const almacen = await Almacen.findById(req.params.id);
    if (!almacen) {
      const error = new Error('Almacén no encontrado.');
      error.statusCode = 404;
      return next(error);
    }
    res.json(almacen);
  } catch (error) {
    next(error);
  }
};

// Create a new Almacen
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { descripcion, ubicacion } = req.body;
    const nuevoAlmacen = new Almacen({ descripcion, ubicacion });
    await nuevoAlmacen.save();
    res.status(201).json(nuevoAlmacen);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Update an existing Almacen by ID
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { descripcion, ubicacion } = req.body;
    const almacen = await Almacen.findByIdAndUpdate(req.params.id, { descripcion, ubicacion }, { new: true, runValidators: true });
    if (!almacen) {
      const error = new Error('Almacén no encontrado para actualizar.');
      error.statusCode = 404;
      return next(error);
    }
    res.json(almacen);
  } catch (error)
 {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Delete an Almacen by ID
exports.remove = async (req, res, next) => {
  try {
    const almacen = await Almacen.findByIdAndDelete(req.params.id);
    if (!almacen) {
      const error = new Error('Almacén no encontrado para eliminar.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: 'Almacén eliminado correctamente.' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
