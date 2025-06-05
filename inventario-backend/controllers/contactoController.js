const Contacto = require('../models/Contacto');
const { validationResult } = require('express-validator');

// List all Contactos, with optional filtering by 'tipo'
exports.list = async (req, res, next) => {
  try {
    const { tipo } = req.query;
    const filter = {};

    if (tipo) {
      // Basic validation for 'tipo' directly in controller for simplicity,
      // though for more complex query validation, express-validator's query() can be used in routes.
      if (!['cliente', 'proveedor'].includes(tipo)) {
        const error = new Error('Valor de "tipo" inválido para filtrar. Use "cliente" o "proveedor".');
        error.statusCode = 400;
        return next(error);
      }
      filter.tipo = tipo;
    }

    const contactos = await Contacto.find(filter);
    res.status(200).json(contactos);
  } catch (error) {
    next(error);
  }
};

// Get a single Contacto by ID
exports.get = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const contacto = await Contacto.findById(req.params.id);
    if (!contacto) {
      const error = new Error('Contacto no encontrado.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(contacto);
  } catch (error) {
    next(error);
  }
};

// Create a new Contacto
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { tipo, identificacion, nombre, direccion, telefono, correo_electronico } = req.body;
    const nuevoContacto = new Contacto({
      tipo,
      identificacion,
      nombre,
      direccion,
      telefono,
      correo_electronico
    });
    await nuevoContacto.save();
    res.status(201).json(nuevoContacto);
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate key error for 'identificacion'
      error.message = `La identificación '${req.body.identificacion}' ya existe.`;
      error.statusCode = 409; // Conflict
    } else if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Update an existing Contacto by ID
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { tipo, identificacion, nombre, direccion, telefono, correo_electronico } = req.body;
    // Build an object with only the fields that are present in the request
    const updates = {};
    if (tipo) updates.tipo = tipo;
    if (identificacion) updates.identificacion = identificacion;
    if (nombre) updates.nombre = nombre;
    if (direccion) updates.direccion = direccion;
    if (telefono) updates.telefono = telefono;
    if (correo_electronico) updates.correo_electronico = correo_electronico;


    const contacto = await Contacto.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!contacto) {
      const error = new Error('Contacto no encontrado para actualizar.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json(contacto);
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate key error for 'identificacion'
       error.message = `La identificación '${req.body.identificacion}' ya existe.`;
       error.statusCode = 409; // Conflict
    } else if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Delete a Contacto by ID
exports.remove = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const contacto = await Contacto.findByIdAndDelete(req.params.id);
    if (!contacto) {
      const error = new Error('Contacto no encontrado para eliminar.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: 'Contacto eliminado correctamente.' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
