const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { body, param } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de Productos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       $ref: '#/components/schemas/Producto' # Defined in swagger.js
 *     ProductoInput:
 *       $ref: '#/components/schemas/ProductoInput' # Defined in swagger.js
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Lista todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Un arreglo de productos, con unidad_medida y almacen poblados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', productoController.list);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalles del producto, con unidad_medida y almacen poblados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400: # For invalid ID format
 *         description: ID de Producto inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Producto no encontrado
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
  param('id').isMongoId().withMessage('ID de Producto inválido.')
], productoController.get);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos o referencia no encontrada (UnidadMedida, Almacen)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: Conflicto, el código de producto ya existe
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
  body('codigo').trim().notEmpty().withMessage('El código es obligatorio.'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria.'),
  body('unidad_medida').isMongoId().withMessage('ID de Unidad de Medida inválido.'),
  body('almacen').isMongoId().withMessage('ID de Almacén inválido.'),
  body('stock_minimo').isNumeric().withMessage('El stock mínimo debe ser un número.')
    .custom(value => {
      if (parseFloat(value) < 0) {
        throw new Error('El stock mínimo no puede ser negativo.');
      }
      return true;
    })
], productoController.create);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput' # Can be a partial schema
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos, ID malformado, o referencia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflicto, el código de producto ya existe (si se intenta cambiar a uno existente)
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
  param('id').isMongoId().withMessage('ID de Producto inválido.'),
  body('codigo').optional().trim().notEmpty().withMessage('El código no puede estar vacío si se proporciona.'),
  body('descripcion').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía si se proporciona.'),
  body('unidad_medida').optional().isMongoId().withMessage('ID de Unidad de Medida inválido.'),
  body('almacen').optional().isMongoId().withMessage('ID de Almacén inválido.'),
  body('stock_minimo').optional().isNumeric().withMessage('El stock mínimo debe ser un número.')
    .custom(value => {
      if (parseFloat(value) < 0) {
        throw new Error('El stock mínimo no puede ser negativo.');
      }
      return true;
    })
], productoController.update);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Elimina un producto por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto eliminado correctamente.
 *       400: # For invalid ID format
 *         description: ID de Producto inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Producto no encontrado
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
  param('id').isMongoId().withMessage('ID de Producto inválido.')
], productoController.remove);

module.exports = router;
