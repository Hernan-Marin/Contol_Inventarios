// tests/registros.api.test.js
const request = require('supertest');
const { app } = require('../server');
const Registro = require('../models/Registro');
const Producto = require('../models/Producto');
const UnidadMedida = require('../models/UnidadMedida');
const Almacen = require('../models/Almacen');
const Contacto = require('../models/Contacto');
const mongoose = require('mongoose');

describe('Registros API', () => {
  let prod, um, alm, proveedor, cliente;
  let baseRegistroData;

  beforeAll(async () => {
    // Create common prerequisites once
    um = await new UnidadMedida({ categoria: 'Peso API', udm: 'KGRegTestAPI' }).save();
    alm = await new Almacen({ descripcion: 'Almacen Registros Test API' }).save();
    prod = await new Producto({ codigo: 'PRODREG001API', descripcion: 'Producto para Registros API', unidad_medida: um._id, almacen: alm._id, stock_minimo: 1 }).save();
    proveedor = await new Contacto({ tipo: 'proveedor', identificacion: 'PROVREG001API', nombre: 'Proveedor Registros API', direccion: 'Dir Prov Reg API' }).save();
    cliente = await new Contacto({ tipo: 'cliente', identificacion: 'CLIREG001API', nombre: 'Cliente Registros API', direccion: 'Dir Cli Reg API' }).save();
  });

  beforeEach(() => {
    // Base data for each test, can be overridden
    baseRegistroData = {
      fecha: new Date().toISOString().split('T')[0], // Just date part for consistency with QInput type="date"
      almacen: alm._id.toString(),
      codigo_articulo: prod._id.toString(),
      unidad_medida: um._id.toString(),
      observaciones: 'Registro de prueba API',
    };
  });

  // POST /api/registros
  describe('POST /api/registros', () => {
    it('should create an "entrada" registro with valid data', async () => {
      const res = await request(app)
        .post('/api/registros')
        .send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: proveedor._id.toString() });
      expect(res.statusCode).toEqual(201);
      expect(res.body.tipo).toBe('entrada');
      expect(res.body.codigo_proveedor._id.toString()).toBe(proveedor._id.toString());
    });

    it('should create a "salida" registro with valid data', async () => {
      const res = await request(app)
        .post('/api/registros')
        .send({ ...baseRegistroData, tipo: 'salida', entregado_a: cliente._id.toString() });
      expect(res.statusCode).toEqual(201);
      expect(res.body.tipo).toBe('salida');
      expect(res.body.entregado_a._id.toString()).toBe(cliente._id.toString());
    });

    it('should fail to create "entrada" if codigo_proveedor is missing', async () => {
      const res = await request(app)
        .post('/api/registros')
        .send({ ...baseRegistroData, tipo: 'entrada' /* codigo_proveedor missing */ });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('El campo "codigo_proveedor" es obligatorio para registros de tipo "entrada".');
    });

    it('should fail to create "entrada" if codigo_proveedor is not a "proveedor"', async () => {
      const res = await request(app)
        .post('/api/registros')
        .send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: cliente._id.toString() });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('El contacto especificado en "codigo_proveedor" debe ser de tipo "proveedor".');
    });

    it('should fail to create "salida" if entregado_a is missing', async () => {
      const res = await request(app)
        .post('/api/registros')
        .send({ ...baseRegistroData, tipo: 'salida' /* entregado_a missing */ });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('El campo "entregado_a" es obligatorio para registros de tipo "salida".');
    });

    it('should fail to create "salida" if entregado_a is not a "cliente"', async () => {
      const res = await request(app)
        .post('/api/registros')
        .send({ ...baseRegistroData, tipo: 'salida', entregado_a: proveedor._id.toString() });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('El contacto especificado en "entregado_a" debe ser de tipo "cliente".');
    });

    it('should return 400 if a referenced producto does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .post('/api/registros')
            .send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: proveedor._id.toString(), codigo_articulo: nonExistentId });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('El producto especificado no existe');
    });

    it('should return 400 if required fields like "tipo" are missing', async () => {
        const { tipo, ...data } = baseRegistroData; // remove tipo
        const res = await request(app)
            .post('/api/registros')
            .send({ ...data, codigo_proveedor: proveedor._id.toString() });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toBeInstanceOf(Array);
        expect(res.body.errors.some(e => e.path === 'tipo')).toBe(true);
    });
  });

  // GET /api/registros
  describe('GET /api/registros', () => {
    it('should return all registros with populated fields', async () => {
      await request(app).post('/api/registros').send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: proveedor._id.toString() });
      const res = await request(app).get('/api/registros');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const registro = res.body[0];
      expect(registro.almacen).toBeInstanceOf(Object);
      expect(registro.almacen.descripcion).toBe(alm.descripcion);
      expect(registro.codigo_articulo).toBeInstanceOf(Object);
      expect(registro.codigo_proveedor).toBeInstanceOf(Object);
    });
  });

  // GET /api/registros/:id
  describe('GET /api/registros/:id', () => {
    it('should return a registro by ID', async () => {
        const postRes = await request(app).post('/api/registros').send({ ...baseRegistroData, tipo: 'salida', entregado_a: cliente._id.toString() });
        const registroId = postRes.body._id;
        const res = await request(app).get(`/api/registros/${registroId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.tipo).toBe('salida');
        expect(res.body.observaciones).toBe(baseRegistroData.observaciones);
    });
     it('should return 404 for non-existent ID', async () => {
        const res = await request(app).get(`/api/registros/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toEqual(404);
    });
     it('should return 400 for invalid ID format', async () => {
        const res = await request(app).get('/api/registros/invalidID');
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toContain('ID de registro inválido');
    });
  });

  // PUT /api/registros/:id
  describe('PUT /api/registros/:id', () => {
    it('should update a registro (e.g. observaciones)', async () => {
      const postRes = await request(app).post('/api/registros').send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: proveedor._id.toString() });
      const registroId = postRes.body._id;
      const updatedObs = 'Observacion Actualizada Test API';
      // Send only fields to update, plus mandatory fields if schema expects them (or use PATCH)
      // Our controller for PUT allows partial updates, but model validation still runs.
      const res = await request(app)
        .put(`/api/registros/${registroId}`)
        .send({ observaciones: updatedObs, tipo: 'entrada', codigo_proveedor: proveedor._id.toString() }); // ensure type and its deps are valid
      expect(res.statusCode).toEqual(200);
      expect(res.body.observaciones).toBe(updatedObs);
      expect(res.body.tipo).toBe('entrada');
    });

    it('should correctly update and validate if tipo changes from entrada to salida', async () => {
        const postRes = await request(app).post('/api/registros').send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: proveedor._id.toString() });
        const registroId = postRes.body._id;

        const res = await request(app)
            .put(`/api/registros/${registroId}`)
            .send({ ...baseRegistroData, tipo: 'salida', entregado_a: cliente._id.toString(), codigo_proveedor: null }); // Explicitly nullify

        expect(res.statusCode).toEqual(200);
        expect(res.body.tipo).toBe('salida');
        expect(res.body.entregado_a._id.toString()).toBe(cliente._id.toString());
        expect(res.body.codigo_proveedor).toBeNull();
    });

     it('should fail to update tipo from entrada to salida if entregado_a is missing', async () => {
        const postRes = await request(app).post('/api/registros').send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: proveedor._id.toString() });
        const registroId = postRes.body._id;

        const res = await request(app)
            .put(`/api/registros/${registroId}`)
            .send({ ...baseRegistroData, tipo: 'salida', codigo_proveedor: null /* entregado_a missing */ });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('El campo "entregado_a" es obligatorio para registros de tipo "salida".');
    });
  });

  // DELETE /api/registros/:id
  describe('DELETE /api/registros/:id', () => {
    it('should delete a registro', async () => {
      const postRes = await request(app).post('/api/registros').send({ ...baseRegistroData, tipo: 'entrada', codigo_proveedor: proveedor._id.toString() });
      const registroId = postRes.body._id;
      const res = await request(app).delete(`/api/registros/${registroId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Registro eliminado correctamente.');
      const found = await Registro.findById(registroId);
      expect(found).toBeNull();
    });
    it('should return 404 for non-existent ID on delete', async () => {
        const res = await request(app).delete(`/api/registros/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toEqual(404);
    });
    it('should return 400 for invalid ID format on delete', async () => {
        const res = await request(app).delete('/api/registros/invalidID');
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toContain('ID de registro inválido');
    });
  });
});
