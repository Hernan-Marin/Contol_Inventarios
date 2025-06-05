const UnidadMedida = require('../models/UnidadMedida');
const { validationResult } = require('express-validator');

// List all UnidadesMedida
exports.list = async (req, res, next) => {
  try {
    const unidades = await UnidadMedida.find();
    res.json(unidades);
  } catch (error) {
    next(error);
  }
};

// Get a single UnidadMedida by ID
exports.get = async (req, res, next) => {
  try {
    const unidad = await UnidadMedida.findById(req.params.id);
    if (!unidad) {
      const error = new Error('Unidad de Medida no encontrada.');
      error.statusCode = 404;
      return next(error);
    }
    res.json(unidad);
  } catch (error) {
    next(error);
  }
};

// Create a new UnidadMedida
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { categoria, udm } = req.body;
    const nuevaUnidad = new UnidadMedida({ categoria, udm });
    await nuevaUnidad.save();
    res.status(201).json(nuevaUnidad);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Update an existing UnidadMedida by ID
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { categoria, udm } = req.body;
    const unidad = await UnidadMedida.findByIdAndUpdate(req.params.id, { categoria, udm }, { new: true, runValidators: true });
    if (!unidad) {
      const error = new Error('Unidad de Medida no encontrada para actualizar.');
      error.statusCode = 404;
      return next(error);
    }
    res.json(unidad);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Delete an UnidadMedida by ID
exports.remove = async (req, res, next) => {
  try {
    const unidad = await UnidadMedida.findByIdAndDelete(req.params.id);
    if (!unidad) {
      const error = new Error('Unidad de Medida no encontrada para eliminar.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: 'Unidad de Medida eliminada correctamente.' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
