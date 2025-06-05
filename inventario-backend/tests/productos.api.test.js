// tests/productos.api.test.js
const request = require('supertest');
const { app } = require('../server');
const Producto = require('../models/Producto');
const UnidadMedida = require('../models/UnidadMedida');
const Almacen = require('../models/Almacen');
const mongoose = require('mongoose');

describe('Productos API', () => {
  let testUnidadMedida, testAlmacen;
  let sampleProductoData;

  // Use beforeEach to ensure fresh sampleProductoData for each test, especially if IDs change or objects get modified.
  // Using beforeAll might be okay if sampleProductoData is treated as immutable template.
  // For safety and test independence, beforeEach for data that might be "dirtied" by a test is better.
  // However, testUnidadMedida and testAlmacen can be in beforeAll if they are just for reference IDs.
  beforeAll(async () => {
    testUnidadMedida = await new UnidadMedida({ categoria: 'Test Cat UDM API', udm: 'TSTU-API' }).save();
    testAlmacen = await new Almacen({ descripcion: 'Test Almacen Prod API' }).save();
  });

  beforeEach(() => {
    // Re-initialize sampleProductoData before each test to ensure it's clean,
    // especially if a test modifies it or if _id fields from previous runs linger.
    sampleProductoData = {
      codigo: 'PRODTEST001_API',
      descripcion: 'Producto de Prueba API',
      unidad_medida: testUnidadMedida._id.toString(),
      almacen: testAlmacen._id.toString(),
      stock_minimo: 5,
    };
  });


  // POST /api/productos
  describe('POST /api/productos', () => {
    it('should create a new producto with valid data', async () => {
      const res = await request(app).post('/api/productos').send(sampleProductoData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.codigo).toBe(sampleProductoData.codigo);
      // For POST, the controller populates the response, so we check the object's ID
      expect(res.body.unidad_medida._id).toBe(testUnidadMedida._id.toString());
      expect(res.body.almacen._id).toBe(testAlmacen._id.toString());
    });

    it('should return 400 if required fields are missing (e.g., codigo)', async () => {
      const { codigo, ...incompleteData } = sampleProductoData;
      const res = await request(app).post('/api/productos').send(incompleteData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(e => e.path === 'codigo')).toBe(true);
    });

    it('should return 400 if stock_minimo is negative', async () => {
      const res = await request(app).post('/api/productos').send({ ...sampleProductoData, stock_minimo: -1 });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(e => e.path === 'stock_minimo' && e.msg.includes('no puede ser negativo'))).toBe(true);
    });

    it('should return 400 if unidad_medida ID does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).post('/api/productos').send({ ...sampleProductoData, unidad_medida: nonExistentId });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('La unidad de medida especificada no existe');
    });

    it('should return 400 if almacen ID does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).post('/api/productos').send({ ...sampleProductoData, almacen: nonExistentId });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('El almacén especificado no existe');
    });

    it('should return 409 (as per controller logic for duplicate) if codigo is not unique', async () => {
      await new Producto(sampleProductoData).save(); // Save first product
      const res = await request(app).post('/api/productos').send({...sampleProductoData, descripcion: "Otro producto mismo codigo"}); // Try to save again
      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toContain('El código de producto ya existe');
    });
  });

  // GET /api/productos
  describe('GET /api/productos', () => {
    it('should return all productos with populated UDM and Almacen', async () => {
      await new Producto(sampleProductoData).save();
      const res = await request(app).get('/api/productos');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const product = res.body.find(p => p.codigo === sampleProductoData.codigo);
      expect(product).toBeDefined();
      expect(product.unidad_medida).toBeInstanceOf(Object);
      expect(product.unidad_medida.udm).toBe(testUnidadMedida.udm);
      expect(product.almacen).toBeInstanceOf(Object);
      expect(product.almacen.descripcion).toBe(testAlmacen.descripcion);
    });
  });

  // GET /api/productos/:id
  describe('GET /api/productos/:id', () => {
    it('should return a producto by ID with populated fields', async () => {
      const producto = await new Producto(sampleProductoData).save();
      const res = await request(app).get(`/api/productos/${producto._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.codigo).toBe(sampleProductoData.codigo);
      expect(res.body.unidad_medida.udm).toBe(testUnidadMedida.udm);
    });
    it('should return 404 for non-existent ID', async () => {
      const res = await request(app).get(`/api/productos/${new mongoose.Types.ObjectId()}`);
      expect(res.statusCode).toEqual(404);
    });
    it('should return 400 for invalid ID format', async () => {
        const res = await request(app).get('/api/productos/invalidID');
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toContain('ID de Producto inválido');
    });
  });

  // PUT /api/productos/:id
  describe('PUT /api/productos/:id', () => {
    it('should update a producto', async () => {
      const producto = await new Producto(sampleProductoData).save();
      const updatedDesc = 'Producto Actualizado Globalmente API';
      const res = await request(app)
        .put(`/api/productos/${producto._id}`)
        .send({ descripcion: updatedDesc, stock_minimo: 15 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.descripcion).toBe(updatedDesc);
      expect(res.body.stock_minimo).toBe(15);
    });

     it('should return 400 when updating with non-existent unidad_medida ID', async () => {
      const producto = await new Producto(sampleProductoData).save();
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/api/productos/${producto._id}`)
        .send({ unidad_medida: nonExistentId });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('La unidad de medida especificada no existe');
    });

    it('should return 404 for non-existent ID on update', async () => {
      const res = await request(app)
        .put(`/api/productos/${new mongoose.Types.ObjectId()}`)
        .send({ descripcion: 'No Existo' });
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid ID format on update', async () => {
      const res = await request(app)
        .put(`/api/productos/invalidID`)
        .send({ descripcion: 'Test' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Producto inválido');
    });
  });

  // DELETE /api/productos/:id
  describe('DELETE /api/productos/:id', () => {
    it('should delete a producto', async () => {
      const producto = await new Producto(sampleProductoData).save();
      const res = await request(app).delete(`/api/productos/${producto._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Producto eliminado correctamente');
      const found = await Producto.findById(producto._id);
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent ID on delete', async () => {
      const res = await request(app).delete(`/api/productos/${new mongoose.Types.ObjectId()}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid ID format on delete', async () => {
      const res = await request(app).delete(`/api/productos/invalidID`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Producto inválido');
    });
  });
});
