const express = require('express');
const router = express.Router();
const unidadMedidaController = require('../controllers/unidadMedidaController');
const { body, param } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: UnidadesMedida
 *   description: Gestión de Unidades de Medida
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UnidadMedida:
 *       $ref: '#/components/schemas/UnidadMedida' # Defined in swagger.js
 *     UnidadMedidaInput:
 *       $ref: '#/components/schemas/UnidadMedidaInput' # Defined in swagger.js
 */

/**
 * @swagger
 * /unidades_medidas:
 *   get:
 *     summary: Lista todas las unidades de medida
 *     tags: [UnidadesMedida]
 *     responses:
 *       200:
 *         description: Un arreglo de unidades de medida
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnidadMedida'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', unidadMedidaController.list);

/**
 * @swagger
 * /unidades_medidas/{id}:
 *   get:
 *     summary: Obtiene una unidad de medida por su ID
 *     tags: [UnidadesMedida]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID de la unidad de medida
 *     responses:
 *       200:
 *         description: Detalles de la unidad de medida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadMedida'
 *       404:
 *         description: Unidad de medida no encontrada
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
    param('id').isMongoId().withMessage('ID de Unidad de Medida inválido.')
], unidadMedidaController.get);

/**
 * @swagger
 * /unidades_medidas:
 *   post:
 *     summary: Crea una nueva unidad de medida
 *     tags: [UnidadesMedida]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnidadMedidaInput'
 *     responses:
 *       201:
 *         description: Unidad de medida creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadMedida'
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
  body('categoria').trim().notEmpty().withMessage('La categoría es obligatoria.'),
  body('udm').trim().notEmpty().withMessage('La UDM es obligatoria.')
], unidadMedidaController.create);

/**
 * @swagger
 * /unidades_medidas/{id}:
 *   put:
 *     summary: Actualiza una unidad de medida existente
 *     tags: [UnidadesMedida]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID de la unidad de medida a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnidadMedidaInput' # Can reuse or create a specific update schema
 *     responses:
 *       200:
 *         description: Unidad de medida actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadMedida'
 *       400:
 *         description: Datos de entrada inválidos o ID malformado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Unidad de medida no encontrada
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
  param('id').isMongoId().withMessage('ID de Unidad de Medida inválido.'),
  body('categoria').optional().trim().notEmpty().withMessage('La categoría no puede estar vacía si se proporciona.'),
  body('udm').optional().trim().notEmpty().withMessage('La UDM no puede estar vacía si se proporciona.')
], unidadMedidaController.update);

/**
 * @swagger
 * /unidades_medidas/{id}:
 *   delete:
 *     summary: Elimina una unidad de medida por su ID
 *     tags: [UnidadesMedida]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: ID de la unidad de medida a eliminar
 *     responses:
 *       200:
 *         description: Unidad de medida eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unidad de Medida eliminada correctamente.
 *       400:
 *         description: ID malformado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Unidad de medida no encontrada
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
    param('id').isMongoId().withMessage('ID de Unidad de Medida inválido.')
], unidadMedidaController.remove);

module.exports = router;
