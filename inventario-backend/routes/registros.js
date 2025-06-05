const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');
const { body, param } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Registros
 *   description: Gestión de Entradas y Salidas de Inventario
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Registro:
 *       $ref: '#/components/schemas/Registro' # Defined in swagger.js
 *     RegistroInput:
 *       $ref: '#/components/schemas/RegistroInput' # Defined in swagger.js
 */

/**
 * @swagger
 * /registros:
 *   get:
 *     summary: Lista todos los registros de inventario (entradas/salidas)
 *     tags: [Registros]
 *     responses:
 *       200:
 *         description: Un arreglo de registros, con campos de referencia poblados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registro'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', registroController.list);

/**
 * @swagger
 * /registros/{id}:
 *   get:
 *     summary: Obtiene un registro de inventario por su ID
 *     tags: [Registros]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del registro
 *     responses:
 *       200:
 *         description: Detalles del registro, con campos de referencia poblados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registro'
 *       400: # For invalid ID format
 *         description: ID de Registro inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Registro no encontrado
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
  param('id').isMongoId().withMessage('ID de Registro inválido.')
], registroController.get);

/**
 * @swagger
 * /registros:
 *   post:
 *     summary: Crea un nuevo registro de inventario (entrada o salida)
 *     tags: [Registros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroInput'
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registro'
 *       400:
 *         description: >
 *           Datos de entrada inválidos. Esto puede incluir:
 *           - Campos faltantes o con formato incorrecto.
 *           - IDs de referencia (almacen, producto, etc.) que no existen.
 *           - Violación de la lógica condicional (ej. falta `codigo_proveedor` para una `entrada`, o el contacto no es del tipo correcto).
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', [
  body('fecha').optional().isISO8601().toDate().withMessage('Fecha inválida. Use formato YYYY-MM-DDTHH:MM:SSZ.'),
  body('tipo').isIn(['entrada', 'salida']).withMessage('Tipo de registro inválido. Debe ser "entrada" o "salida".'),
  body('almacen').isMongoId().withMessage('ID de Almacén inválido.'),
  body('codigo_articulo').isMongoId().withMessage('ID de Producto inválido.'),
  body('unidad_medida').isMongoId().withMessage('ID de Unidad de Medida inválido.'),
  body('codigo_proveedor').optional({ checkFalsy: true }).isMongoId().withMessage('ID de Proveedor inválido.'),
  body('entregado_a').optional({ checkFalsy: true }).isMongoId().withMessage('ID de Contacto (entregado a) inválido.'),
  body('observaciones').optional().trim()
], registroController.create);

/**
 * @swagger
 * /registros/{id}:
 *   put:
 *     summary: Actualiza un registro de inventario existente
 *     tags: [Registros]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del registro a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroInput' # Can be a partial schema
 *     responses:
 *       200:
 *         description: Registro actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registro'
 *       400:
 *         description: >
 *           Datos de entrada inválidos. Similar al POST, puede incluir:
 *           - Campos con formato incorrecto.
 *           - IDs de referencia que no existen.
 *           - Violación de la lógica condicional al cambiar campos como `tipo`.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Registro no encontrado
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
  param('id').isMongoId().withMessage('ID de Registro inválido.'),
  body('fecha').optional().isISO8601().toDate().withMessage('Fecha inválida. Use formato YYYY-MM-DDTHH:MM:SSZ.'),
  body('tipo').optional().isIn(['entrada', 'salida']).withMessage('Tipo de registro inválido. Debe ser "entrada" o "salida".'),
  body('almacen').optional().isMongoId().withMessage('ID de Almacén inválido.'),
  body('codigo_articulo').optional().isMongoId().withMessage('ID de Producto inválido.'),
  body('unidad_medida').optional().isMongoId().withMessage('ID de Unidad de Medida inválido.'),
  body('codigo_proveedor').optional({ checkFalsy: true }).isMongoId().withMessage('ID de Proveedor inválido.'),
  body('entregado_a').optional({ checkFalsy: true }).isMongoId().withMessage('ID de Contacto (entregado a) inválido.'),
  body('observaciones').optional().trim()
], registroController.update);

/**
 * @swagger
 * /registros/{id}:
 *   delete:
 *     summary: Elimina un registro de inventario por su ID
 *     tags: [Registros]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del registro a eliminar
 *     responses:
 *       200:
 *         description: Registro eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registro eliminado correctamente.
 *       400: # For invalid ID format
 *         description: ID de Registro inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Registro no encontrado
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
  param('id').isMongoId().withMessage('ID de Registro inválido.')
], registroController.remove);

module.exports = router;
