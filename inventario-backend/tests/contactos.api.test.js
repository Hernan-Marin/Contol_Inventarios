// tests/contactos.api.test.js
const request = require('supertest');
const { app } = require('../server');
const Contacto = require('../models/Contacto');
const mongoose = require('mongoose');

describe('Contactos API', () => {
  const sampleCliente = { tipo: 'cliente', identificacion: 'CLI001_API', nombre: 'Cliente Test API', direccion: 'Calle Cliente API 1', telefono: '1112223', correo_electronico: 'cliente.api@test.com' };
  const sampleProveedor = { tipo: 'proveedor', identificacion: 'PROV001_API', nombre: 'Proveedor Test API', direccion: 'Calle Proveedor API 1', telefono: '3334445', correo_electronico: 'prov.api@test.com' };

  // POST /api/contactos
  describe('POST /api/contactos', () => {
    it('should create a new cliente', async () => {
      const res = await request(app).post('/api/contactos').send(sampleCliente);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(sampleCliente.nombre);
      expect(res.body.tipo).toBe('cliente');
    });

    it('should create a new proveedor', async () => {
      const res = await request(app).post('/api/contactos').send(sampleProveedor);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(sampleProveedor.nombre);
      expect(res.body.tipo).toBe('proveedor');
    });

    it('should return 400 if required fields (identificacion, nombre, direccion) are missing', async () => {
      const res = await request(app).post('/api/contactos').send({ tipo: 'cliente' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      // Check for specific missing fields
      const errorMessages = res.body.errors.map(e => e.path);
      expect(errorMessages).toContain('identificacion');
      expect(errorMessages).toContain('nombre');
      expect(errorMessages).toContain('direccion');
    });

    it('should return 400 if tipo is missing', async () => {
        const res = await request(app).post('/api/contactos').send({ identificacion: 'ID123', nombre: 'Test', direccion: 'Dir Test' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toBeInstanceOf(Array);
        const errorMessages = res.body.errors.map(e => e.path);
        expect(errorMessages).toContain('tipo');
      });

    it('should return 400 for invalid tipo', async () => {
      const res = await request(app).post('/api/contactos').send({ ...sampleCliente, tipo: 'INVALIDO' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('Tipo de contacto inválido');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app).post('/api/contactos').send({ ...sampleCliente, correo_electronico: 'invalidmail' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('Correo electrónico inválido');
    });

    it('should return 409 if identificacion is not unique', async () => {
      await new Contacto(sampleCliente).save();
      const res = await request(app).post('/api/contactos').send({ ...sampleProveedor, identificacion: sampleCliente.identificacion });
      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toContain(`La identificación '${sampleCliente.identificacion}' ya existe.`);
    });
  });

  // GET /api/contactos
  describe('GET /api/contactos', () => {
    beforeEach(async () => {
      // Ensure unique identificacion for each beforeEach run if tests are parallel or state leaks
      await Contacto.create({...sampleCliente, identificacion: 'GETCLI001'});
      await Contacto.create({...sampleProveedor, identificacion: 'GETPROV001'});
    });

    it('should return all contactos', async () => {
      const res = await request(app).get('/api/contactos');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
    });

    it('should return only clientes if filtered by tipo=cliente', async () => {
      const res = await request(app).get('/api/contactos?tipo=cliente');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].tipo).toBe('cliente');
    });

    it('should return only proveedores if filtered by tipo=proveedor', async () => {
      const res = await request(app).get('/api/contactos?tipo=proveedor');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].tipo).toBe('proveedor');
    });

    it('should return 400 if filtered by invalid tipo in query param', async () => {
      const res = await request(app).get('/api/contactos?tipo=INVALIDO');
      // This validation is in the route: query('tipo').optional().isIn(['cliente', 'proveedor'])
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('Tipo de filtro inválido');
    });
  });

  // GET /api/contactos/:id
  describe('GET /api/contactos/:id', () => {
    it('should return a contacto by ID', async () => {
      const contacto = await new Contacto(sampleCliente).save();
      const res = await request(app).get(`/api/contactos/${contacto._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.nombre).toBe(sampleCliente.nombre);
    });
    it('should return 404 for non-existent ID', async () => {
      const res = await request(app).get(`/api/contactos/${new mongoose.Types.ObjectId()}`);
      expect(res.statusCode).toEqual(404);
    });
     it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get(`/api/contactos/invalidID`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Contacto inválido');
    });
  });

  // PUT /api/contactos/:id
  describe('PUT /api/contactos/:id', () => {
    it('should update a contacto', async () => {
      const contacto = await new Contacto(sampleCliente).save();
      const updatedData = { nombre: 'Cliente Actualizado API', telefono: '5556667' };
      const res = await request(app).put(`/api/contactos/${contacto._id}`).send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.nombre).toBe('Cliente Actualizado API');
      expect(res.body.telefono).toBe('5556667');
    });

    it('should return 409 if updating identificacion to an existing one (different doc)', async () => {
        const contacto1 = await new Contacto({...sampleCliente, identificacion: 'PUTCLI001'}).save();
        const contacto2 = await new Contacto({...sampleProveedor, identificacion: 'PUTPROV001'}).save();
        const res = await request(app)
            .put(`/api/contactos/${contacto2._id}`)
            .send({ identificacion: contacto1.identificacion });
        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toContain(`La identificación '${contacto1.identificacion}' ya existe`);
    });

    it('should return 404 for non-existent ID on update', async () => {
        const res = await request(app)
            .put(`/api/contactos/${new mongoose.Types.ObjectId()}`)
            .send({ nombre: 'No Existo' });
        expect(res.statusCode).toEqual(404);
    });
     it('should return 400 for invalid ID format on update', async () => {
      const res = await request(app).put(`/api/contactos/invalidID`).send({ nombre: 'Test' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Contacto inválido');
    });
  });

  // DELETE /api/contactos/:id
  describe('DELETE /api/contactos/:id', () => {
    it('should delete a contacto', async () => {
      const contacto = await new Contacto(sampleCliente).save();
      const res = await request(app).delete(`/api/contactos/${contacto._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Contacto eliminado correctamente');
      const found = await Contacto.findById(contacto._id);
      expect(found).toBeNull();
    });
     it('should return 404 for non-existent ID on delete', async () => {
        const res = await request(app).delete(`/api/contactos/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toEqual(404);
    });
    it('should return 400 for invalid ID format on delete', async () => {
      const res = await request(app).delete(`/api/contactos/invalidID`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toContain('ID de Contacto inválido');
    });
  });
});
