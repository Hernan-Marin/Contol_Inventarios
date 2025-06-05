const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');
const { body, param, query } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Contactos
 *   description: Gestión de Clientes y Proveedores
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contacto:
 *       $ref: '#/components/schemas/Contacto' # Defined in swagger.js
 *     ContactoInput:
 *       $ref: '#/components/schemas/ContactoInput' # Defined in swagger.js
 */

/**
 * @swagger
 * /contactos:
 *   get:
 *     summary: Lista todos los contactos (clientes y/o proveedores)
 *     tags: [Contactos]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [cliente, proveedor]
 *         required: false
 *         description: Filtra los contactos por tipo (cliente o proveedor)
 *     responses:
 *       200:
 *         description: Un arreglo de contactos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contacto'
 *       400:
 *         description: Parámetro 'tipo' inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', [
    query('tipo').optional().isIn(['cliente', 'proveedor']).withMessage('Tipo de filtro inválido. Debe ser "cliente" o "proveedor".')
], contactoController.list);

/**
 * @swagger
 * /contactos/{id}:
 *   get:
 *     summary: Obtiene un contacto por su ID
 *     tags: [Contactos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del contacto
 *     responses:
 *       200:
 *         description: Detalles del contacto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contacto'
 *       400: # For invalid ID format
 *         description: ID de Contacto inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Contacto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('ID de Contacto inválido.')
], contactoController.get);

/**
 * @swagger
 * /contactos:
 *   post:
 *     summary: Crea un nuevo contacto (cliente o proveedor)
 *     tags: [Contactos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactoInput'
 *     responses:
 *       201:
 *         description: Contacto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contacto'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: Conflicto, la identificación ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', [
  body('tipo').isIn(['cliente', 'proveedor']).withMessage('Tipo de contacto inválido. Debe ser "cliente" o "proveedor".'),
  body('identificacion').trim().notEmpty().withMessage('La identificación es obligatoria.'),
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('direccion').trim().notEmpty().withMessage('La dirección es obligatoria.'),
  body('telefono').optional({ checkFalsy: true }).trim(),
  body('correo_electronico').optional({ checkFalsy: true }).isEmail().withMessage('Correo electrónico inválido.').normalizeEmail()
], contactoController.create);

/**
 * @swagger
 * /contactos/{id}:
 *   put:
 *     summary: Actualiza un contacto existente
 *     tags: [Contactos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del contacto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactoInput' # Can be a partial schema for updates
 *     responses:
 *       200:
 *         description: Contacto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contacto'
 *       400:
 *         description: Datos de entrada inválidos o ID malformado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Contacto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflicto, la identificación ya existe (si se intenta cambiar a una existente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', [
  param('id').isMongoId().withMessage('ID de Contacto inválido.'),
  body('tipo').optional().isIn(['cliente', 'proveedor']).withMessage('Tipo de contacto inválido. Debe ser "cliente" o "proveedor".'),
  body('identificacion').optional().trim().notEmpty().withMessage('La identificación no puede estar vacía si se proporciona.'),
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío si se proporciona.'),
  body('direccion').optional().trim().notEmpty().withMessage('La dirección no puede estar vacía si se proporciona.'),
  body('telefono').optional({ checkFalsy: true }).trim(),
  body('correo_electronico').optional({ checkFalsy: true }).isEmail().withMessage('Correo electrónico inválido.').normalizeEmail()
], contactoController.update);

/**
 * @swagger
 * /contactos/{id}:
 *   delete:
 *     summary: Elimina un contacto por su ID
 *     tags: [Contactos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del contacto a eliminar
 *     responses:
 *       200:
 *         description: Contacto eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contacto eliminado correctamente.
 *       400: # For invalid ID format
 *         description: ID de Contacto inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Contacto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', [
  param('id').isMongoId().withMessage('ID de Contacto inválido.')
], contactoController.remove);

module.exports = router;
