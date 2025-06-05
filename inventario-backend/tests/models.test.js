const mongoose = require('mongoose');
const Registro = require('../models/Registro');
const Contacto = require('../models/Contacto');
const Producto = require('../models/Producto');
const Almacen = require('../models/Almacen');
const UnidadMedida = require('../models/UnidadMedida');

describe('Model Validations', () => {

  describe('Registro Model Validations', () => {
    let proveedor, cliente, producto, almacen, unidadMedida;

    beforeEach(async () => {
      // Create dummy related documents needed for Registro validation
      proveedor = await new Contacto({ tipo: 'proveedor', identificacion: 'PROV001_REG', nombre: 'Test Proveedor Reg', direccion: 'Calle Falsa Reg 123' }).save();
      cliente = await new Contacto({ tipo: 'cliente', identificacion: 'CLI001_REG', nombre: 'Test Cliente Reg', direccion: 'Av. Siempreviva Reg 742' }).save();
      almacen = await new Almacen({ descripcion: 'Almacen Central Reg' }).save();
      unidadMedida = await new UnidadMedida({ categoria: 'Unidad Reg', udm: 'PZA-REG' }).save();
      producto = await new Producto({
        codigo: 'PROD001_REG',
        descripcion: 'Test Producto Reg',
        unidad_medida: unidadMedida._id,
        almacen: almacen._id,
        stock_minimo: 10
      }).save();
    });

    it('should save a valid "entrada" registro with a "proveedor"', async () => {
      const registroData = {
        fecha: new Date(),
        tipo: 'entrada',
        almacen: almacen._id,
        codigo_articulo: producto._id,
        unidad_medida: unidadMedida._id,
        codigo_proveedor: proveedor._id,
      };
      const registro = new Registro(registroData);
      await expect(registro.save()).resolves.toBeDefined();
      expect(registro.codigo_proveedor).toEqual(proveedor._id);
      expect(registro.entregado_a).toBeUndefined();
    });

    it('should fail to save "entrada" registro if codigo_proveedor is missing', async () => {
      const registroData = {
        fecha: new Date(),
        tipo: 'entrada',
        almacen: almacen._id,
        codigo_articulo: producto._id,
        unidad_medida: unidadMedida._id,
      };
      const registro = new Registro(registroData);
      let err;
      try {
        await registro.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      // The actual error message comes from the model's pre-save hook, not directly from schema validation error.errors
      expect(err.message).toContain('El campo "codigo_proveedor" es obligatorio para registros de tipo "entrada".');
    });

    it('should fail to save "entrada" registro if codigo_proveedor is not of type "proveedor"', async () => {
      const registroData = {
        fecha: new Date(),
        tipo: 'entrada',
        almacen: almacen._id,
        codigo_articulo: producto._id,
        unidad_medida: unidadMedida._id,
        codigo_proveedor: cliente._id, // Using a 'cliente' contact
      };
      const registro = new Registro(registroData);
      let err;
      try {
        await registro.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain('El contacto especificado en "codigo_proveedor" debe ser de tipo "proveedor".');
    });

    it('should save a valid "salida" registro with a "cliente"', async () => {
      const registroData = {
        fecha: new Date(),
        tipo: 'salida',
        almacen: almacen._id,
        codigo_articulo: producto._id,
        unidad_medida: unidadMedida._id,
        entregado_a: cliente._id,
      };
      const registro = new Registro(registroData);
      await expect(registro.save()).resolves.toBeDefined();
      expect(registro.entregado_a).toEqual(cliente._id);
      expect(registro.codigo_proveedor).toBeUndefined();
    });

    it('should fail to save "salida" registro if entregado_a is missing', async () => {
      const registroData = {
        fecha: new Date(),
        tipo: 'salida',
        almacen: almacen._id,
        codigo_articulo: producto._id,
        unidad_medida: unidadMedida._id,
      };
      const registro = new Registro(registroData);
      let err;
      try {
        await registro.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain('El campo "entregado_a" es obligatorio para registros de tipo "salida".');
    });

    it('should fail to save "salida" registro if entregado_a is not of type "cliente"', async () => {
      const registroData = {
        fecha: new Date(),
        tipo: 'salida',
        almacen: almacen._id,
        codigo_articulo: producto._id,
        unidad_medida: unidadMedida._id,
        entregado_a: proveedor._id, // Using a 'proveedor' contact
      };
      const registro = new Registro(registroData);
      let err;
      try {
        await registro.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain('El contacto especificado en "entregado_a" debe ser de tipo "cliente".');
    });
  });

  describe('Producto Model Validations', () => {
    let unidadMedida, almacen;
    beforeEach(async () => {
      almacen = await new Almacen({ descripcion: 'Almacen Test Prod' }).save();
      unidadMedida = await new UnidadMedida({ categoria: 'Volumen', udm: 'LT-PROD' }).save();
    });

    it('should require codigo, descripcion, unidad_medida, almacen, stock_minimo', async () => {
      const producto = new Producto();
      let err;
      try { await producto.save(); } catch (e) { err = e; }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.codigo).toBeDefined();
      expect(err.errors.descripcion).toBeDefined();
      expect(err.errors.unidad_medida).toBeDefined();
      expect(err.errors.almacen).toBeDefined();
      expect(err.errors.stock_minimo).toBeDefined();
    });

    it('stock_minimo should not be negative', async () => {
      const productoData = { codigo: 'P001_PROD', descripcion: 'Test Prod', unidad_medida: unidadMedida._id, almacen: almacen._id, stock_minimo: -1 };
      const producto = new Producto(productoData);
      let err;
      try { await producto.save(); } catch (e) { err = e; }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.stock_minimo.message).toContain('El stock mínimo no puede ser negativo');
    });

    it('codigo should be unique', async () => {
      const commonData = { descripcion: 'Test Prod Unique', unidad_medida: unidadMedida._id, almacen: almacen._id, stock_minimo: 0 };
      await new Producto({ codigo: 'UNIQUE01_PROD', ...commonData }).save();
      const duplicateProducto = new Producto({ codigo: 'UNIQUE01_PROD', ...commonData });
      let err;
      try { await duplicateProducto.save(); } catch (e) { err = e; }
      expect(err.code).toBe(11000); // MongoDB duplicate key error code
    });
  });

  describe('Contacto Model Validations', () => {
      it('should require tipo, identificacion, nombre, direccion', async () => {
          const contacto = new Contacto();
          let err;
          try { await contacto.save(); } catch (e) { err = e; }
          expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
          expect(err.errors.tipo).toBeDefined();
          expect(err.errors.identificacion).toBeDefined();
          expect(err.errors.nombre).toBeDefined();
          expect(err.errors.direccion).toBeDefined();
      });

      it('tipo must be "cliente" or "proveedor"', async () => {
          const contactoData = { tipo: 'otro', identificacion: 'ID002_CONT', nombre: 'Nombre Cont', direccion: 'Dir Cont' };
          const contacto = new Contacto(contactoData);
          let err;
          try { await contacto.save(); } catch (e) { err = e; }
          expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
          expect(err.errors.tipo).toBeDefined();
      });

      it('identificacion should be unique', async () => {
          const commonData = { tipo: 'cliente', nombre: 'Nombre Cont Unique', direccion: 'Dir Cont Unique' };
          await new Contacto({ identificacion: 'IDUNIQUE01_CONT', ...commonData }).save();
          const duplicate = new Contacto({ identificacion: 'IDUNIQUE01_CONT', ...commonData });
          let err;
          try { await duplicate.save(); } catch (e) { err = e; }
          expect(err.code).toBe(11000);
      });

      it('correo_electronico should be valid format', async () => {
          const contactoData = { tipo: 'cliente', identificacion: 'ID003_CONT', nombre: 'N Cont', direccion: 'D Cont', correo_electronico: 'invalidmail' };
          const contacto = new Contacto(contactoData);
          let err;
          try { await contacto.save(); } catch (e) { err = e; }
          expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
          expect(err.errors.correo_electronico.message).toContain('Por favor ingrese un correo electrónico válido');
      });
  });

  describe('UnidadMedida Model Validations', () => {
    it('should require categoria and udm', async () => {
      const unidad = new UnidadMedida();
      let err;
      try { await unidad.save(); } catch (e) { err = e; }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.categoria).toBeDefined();
      expect(err.errors.udm).toBeDefined();
    });
  });

  describe('Almacen Model Validations', () => {
    it('should require descripcion', async () => {
      const almacen = new Almacen();
      let err;
      try { await almacen.save(); } catch (e) { err = e; }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.descripcion).toBeDefined();
    });
  });
});
