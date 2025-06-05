// tests/unidadesMedida.api.test.js
const request = require('supertest');
const { app } = require('../server'); // Adjust path if server.js is elsewhere
const UnidadMedida = require('../models/UnidadMedida');
const mongoose = require('mongoose');

describe('Unidades de Medida API', () => {
  // POST /api/unidades_medidas
  describe('POST /api/unidades_medidas', () => {
    it('should create a new unidad de medida with valid data', async () => {
      const res = await request(app)
        .post('/api/unidades_medidas')
        .send({ categoria: 'Peso', udm: 'KG' });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.categoria).toBe('Peso');
      expect(res.body.udm).toBe('KG');
    });

    it('should return 400 if categoria is missing', async () => {
      const res = await request(app)
        .post('/api/unidades_medidas')
        .send({ udm: 'KG' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors[0].msg).toContain('La categoría es obligatoria');
    });

    it('should return 400 if udm is missing', async () => {
      const res = await request(app)
        .post('/api/unidades_medidas')
        .send({ categoria: 'Peso' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors[0].msg).toContain('La UDM es obligatoria');
    });
  });

  // GET /api/unidades_medidas
  describe('GET /api/unidades_medidas', () => {
    it('should return all unidades de medida', async () => {
      await new UnidadMedida({ categoria: 'Volumen', udm: 'LT' }).save();
      await new UnidadMedida({ categoria: 'Longitud', udm: 'MT' }).save();

      const res = await request(app).get('/api/unidades_medidas');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2); // Assuming afterEach in setup.js cleans up properly
    });
  });

  // GET /api/unidades_medidas/:id
  describe('GET /api/unidades_medidas/:id', () => {
    it('should return a specific unidad de medida if ID is valid', async () => {
      const unidad = await new UnidadMedida({ categoria: 'Tiempo', udm: 'HR' }).save();
      const res = await request(app).get(`/api/unidades_medidas/${unidad._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.udm).toBe('HR');
    });

    it('should return 404 if ID is not found', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/unidades_medidas/${invalidId}`);
      expect(res.statusCode).toEqual(404);
    });
     it('should return 400 if ID is not a valid MongoID format', async () => {
      const res = await request(app).get(`/api/unidades_medidas/invalidIdFormat`);
      // The controller does not have specific validation for MongoID format on GET /:id,
      // Mongoose might throw an error that leads to 500, or if not found, 404.
      // For express-validator on routes, it would be 400.
      // Let's check what the current controller/route setup for GET /:id does.
      // Route: router.get('/:id', unidadMedidaController.get);
      // Controller: no explicit validation for ID format, relies on Mongoose.
      // Mongoose findById with an invalid format string might throw CastError.
      // This CastError needs to be handled by the global error handler or in controller.
      // If CastError is not caught and handled to return 400, it might be a 500 or other.
      // For now, assuming it might propagate to the global error handler or a Mongoose error.
      // A specific check in the route for param('id').isMongoId() would ensure 400.
      // The current global error handler returns 500 if no statusCode on error.
      // Let's assume CastError from Mongoose will be handled by global error handler as 500 if not specified otherwise.
      // To make this test pass with 400, validation should be added to the route.
      // Given current code, it might be 500 or 404 if Mongoose handles it gracefully by not finding.
      // Let's test for a non-500, as 500 would be a server error.
      // If it's 404, it means Mongoose findById(non-mongo-id-string) returns null.
      expect(res.statusCode).not.toBe(500); // Should not be an unhandled server error
      // It's better to add ID format validation in the route to get a 400.
      // For now, this test is a bit weak due to lack of explicit ID format validation in the route.
      // If param('id').isMongoId() was used in routes/unidadesMedida.js for GET /:id, then 400.
      // Let's assume it's not there and Mongoose returns null for badly formatted ID, leading to 404.
      // Actually, the current controller's get method for UnidadMedida doesn't have param validation.
      // The Contacto get method does have it.
      // So this will likely be a CastError from Mongoose, leading to a 500 from the global error handler.
      // This test should ideally be 400. I will write it for 400, implying the route should be fixed.
      // For now, I will check what it currently does. It's likely a 500.
      // Let's adjust the test to expect 500 for now, and make a note to fix the route later.
      // Update: The global error handler will catch Mongoose CastError and return 500.
      // This is not ideal. A validation middleware in the route is better.
      // Let's write the test to expect 400, assuming we'd add `param('id').isMongoId()` to the route.
      // The provided example in the prompt has this validation for other routes.
      // Let's assume it should be there for consistency.
       expect(res.statusCode).toEqual(400); // This assumes param('id').isMongoId() is on the route
       expect(res.body.errors[0].msg).toContain('ID de Unidad de Medida inválido');


    });
  });

  // PUT /api/unidades_medidas/:id
  describe('PUT /api/unidades_medidas/:id', () => {
    it('should update an existing unidad de medida', async () => {
      const unidad = await new UnidadMedida({ categoria: 'Digital', udm: 'MB' }).save();
      const res = await request(app)
        .put(`/api/unidades_medidas/${unidad._id}`)
        .send({ categoria: 'Digital Storage', udm: 'GB' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.udm).toBe('GB');
      expect(res.body.categoria).toBe('Digital Storage');
    });
    it('should return 404 if ID for update is not found', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/unidades_medidas/${invalidId}`)
        .send({ categoria: 'Test', udm: 'TST'});
      expect(res.statusCode).toEqual(404);
    });
     it('should return 400 for invalid ID format on update', async () => {
      const res = await request(app)
        .put(`/api/unidades_medidas/invalidId`)
        .send({ categoria: 'Test', udm: 'TST'});
      expect(res.statusCode).toEqual(400);
       expect(res.body.errors[0].msg).toContain('ID de Unidad de Medida inválido');
    });
  });

  // DELETE /api/unidades_medidas/:id
  describe('DELETE /api/unidades_medidas/:id', () => {
    it('should delete an existing unidad de medida', async () => {
      const unidad = await new UnidadMedida({ categoria: 'Otro', udm: 'UND' }).save();
      const res = await request(app).delete(`/api/unidades_medidas/${unidad._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Unidad de Medida eliminada correctamente.');

      const found = await UnidadMedida.findById(unidad._id);
      expect(found).toBeNull();
    });
    it('should return 404 if ID for delete is not found', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/unidades_medidas/${invalidId}`);
      expect(res.statusCode).toEqual(404);
    });
    it('should return 400 for invalid ID format on delete', async () => {
      const res = await request(app).delete(`/api/unidades_medidas/invalidId`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Unidad de Medida inválido');
    });
  });
});
