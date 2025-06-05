const express = require('express');
const router = express.Router();
const almacenController = require('../controllers/almacenController');
const { body, param } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Almacenes
 *   description: Gestión de Almacenes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Almacen:
 *       $ref: '#/components/schemas/Almacen' # Defined in swagger.js
 *     AlmacenInput:
 *       $ref: '#/components/schemas/AlmacenInput' # Defined in swagger.js
 */

/**
 * @swagger
 * /almacenes:
 *   get:
 *     summary: Lista todos los almacenes
 *     tags: [Almacenes]
 *     responses:
 *       200:
 *         description: Un arreglo de almacenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Almacen'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', almacenController.list);

/**
 * @swagger
 * /almacenes/{id}:
 *   get:
 *     summary: Obtiene un almacén por su ID
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Detalles del almacén
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Almacen'
 *       400: # For invalid ID format
 *         description: ID de Almacén inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Almacén no encontrado
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
    param('id').isMongoId().withMessage('ID de Almacén inválido.')
], almacenController.get);

/**
 * @swagger
 * /almacenes:
 *   post:
 *     summary: Crea un nuevo almacén
 *     tags: [Almacenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlmacenInput'
 *     responses:
 *       201:
 *         description: Almacén creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Almacen'
 *       400:
 *         description: Datos de entrada inválidos
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
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria.'),
  body('ubicacion').optional().trim()
], almacenController.create);

/**
 * @swagger
 * /almacenes/{id}:
 *   put:
 *     summary: Actualiza un almacén existente
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del almacén a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlmacenInput'
 *     responses:
 *       200:
 *         description: Almacén actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Almacen'
 *       400:
 *         description: Datos de entrada inválidos o ID malformado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Almacén no encontrado
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
  param('id').isMongoId().withMessage('ID de Almacén inválido.'),
  body('descripcion').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía si se proporciona.'),
  body('ubicacion').optional().trim()
], almacenController.update);

/**
 * @swagger
 * /almacenes/{id}:
 *   delete:
 *     summary: Elimina un almacén por su ID
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del almacén a eliminar
 *     responses:
 *       200:
 *         description: Almacén eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Almacén eliminado correctamente.
 *       400: # For invalid ID format
 *         description: ID de Almacén inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Almacén no encontrado
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
    param('id').isMongoId().withMessage('ID de Almacén inválido.')
], almacenController.remove);

module.exports = router;
