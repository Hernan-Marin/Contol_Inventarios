// tests/almacenes.api.test.js
const request = require('supertest');
const { app } = require('../server');
const Almacen = require('../models/Almacen');
const mongoose = require('mongoose');

describe('Almacenes API', () => {
  // POST /api/almacenes
  describe('POST /api/almacenes', () => {
    it('should create a new almacen with valid data', async () => {
      const res = await request(app)
        .post('/api/almacenes')
        .send({ descripcion: 'Almacen Principal', ubicacion: 'Zona A' });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.descripcion).toBe('Almacen Principal');
      expect(res.body.ubicacion).toBe('Zona A');
    });

    it('should create a new almacen if only descripcion is provided (ubicacion is optional)', async () => {
      const res = await request(app)
        .post('/api/almacenes')
        .send({ descripcion: 'Almacen Secundario' });
      expect(res.statusCode).toEqual(201);
      expect(res.body.descripcion).toBe('Almacen Secundario');
      expect(res.body.ubicacion).toBeUndefined();
    });

    it('should return 400 if descripcion is missing', async () => {
      const res = await request(app)
        .post('/api/almacenes')
        .send({ ubicacion: 'Zona B' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors[0].msg).toContain('La descripción es obligatoria');
    });
  });

  // GET /api/almacenes
  describe('GET /api/almacenes', () => {
    it('should return all almacenes', async () => {
      await new Almacen({ descripcion: 'Almacen Norte' }).save();
      await new Almacen({ descripcion: 'Almacen Sur', ubicacion: 'Sector Sur' }).save();
      const res = await request(app).get('/api/almacenes');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
    });
  });

  // GET /api/almacenes/:id
  describe('GET /api/almacenes/:id', () => {
    it('should return a specific almacen if ID is valid', async () => {
      const almacen = await new Almacen({ descripcion: 'Deposito Central' }).save();
      const res = await request(app).get(`/api/almacenes/${almacen._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.descripcion).toBe('Deposito Central');
    });

    it('should return 404 if ID is not found', async () => {
      const res = await request(app).get(`/api/almacenes/${new mongoose.Types.ObjectId()}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 if ID is not a valid MongoID format', async () => {
      const res = await request(app).get(`/api/almacenes/invalidIdFormat`);
       expect(res.statusCode).toEqual(400);
       expect(res.body.errors[0].msg).toContain('ID de Almacén inválido');
    });
  });

  // PUT /api/almacenes/:id
  describe('PUT /api/almacenes/:id', () => {
    it('should update an existing almacen', async () => {
      const almacen = await new Almacen({ descripcion: 'Viejo Almacen' }).save();
      const res = await request(app)
        .put(`/api/almacenes/${almacen._id}`)
        .send({ descripcion: 'Nuevo Almacen Renovado', ubicacion: 'Nueva Ubicacion' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.descripcion).toBe('Nuevo Almacen Renovado');
      expect(res.body.ubicacion).toBe('Nueva Ubicacion');
    });

    it('should update only descripcion if ubicacion is not provided', async () => {
      const almacen = await new Almacen({ descripcion: 'Almacen Original', ubicacion: 'Ubicacion Original' }).save();
      const res = await request(app)
        .put(`/api/almacenes/${almacen._id}`)
        .send({ descripcion: 'Descripcion Actualizada' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.descripcion).toBe('Descripcion Actualizada');
      expect(res.body.ubicacion).toBe('Ubicacion Original'); // Should remain unchanged
    });

    it('should clear ubicacion if an empty string is provided for it', async () => {
      const almacen = await new Almacen({ descripcion: 'Almacen Con Ubicacion', ubicacion: 'Aqui Estoy' }).save();
      const res = await request(app)
        .put(`/api/almacenes/${almacen._id}`)
        .send({ descripcion: 'Almacen Con Ubicacion', ubicacion: '' }); // Sending empty string for ubicacion
      expect(res.statusCode).toEqual(200);
      expect(res.body.descripcion).toBe('Almacen Con Ubicacion');
      expect(res.body.ubicacion).toBe(''); // Check if it's cleared or handled as per model/controller logic
    });


    it('should return 404 if ID for update is not found', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/almacenes/${invalidId}`)
        .send({ descripcion: 'No Existe'});
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid ID format on update', async () => {
      const res = await request(app)
        .put(`/api/almacenes/invalidId`)
        .send({ descripcion: 'Test'});
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Almacén inválido');
    });
  });

  // DELETE /api/almacenes/:id
  describe('DELETE /api/almacenes/:id', () => {
    it('should delete an existing almacen', async () => {
      const almacen = await new Almacen({ descripcion: 'Almacen a Borrar' }).save();
      const res = await request(app).delete(`/api/almacenes/${almacen._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Almacén eliminado correctamente.');

      const found = await Almacen.findById(almacen._id);
      expect(found).toBeNull();
    });

    it('should return 404 if ID for delete is not found', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/almacenes/${invalidId}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid ID format on delete', async () => {
      const res = await request(app).delete(`/api/almacenes/invalidId`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Almacén inválido');
    });
  });
});
