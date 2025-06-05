const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventario API',
      version: '1.0.0',
      description: 'API documentation for the Inventario system.',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support', // Optional
        // email: 'support@example.com' // Optional
      },
    },
    servers: [
      {
        // Dynamically determine the server URL based on NODE_ENV or a specific env variable
        url: `${process.env.API_BASE_URL || 'http://localhost:' + (process.env.PORT || 3000)}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      schemas: {
        UnidadMedida: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID generado por MongoDB', readOnly: true },
            categoria: { type: 'string', description: 'Categoría de la unidad de medida', example: 'Peso' },
            udm: { type: 'string', description: 'Unidad de medida', example: 'Kg' },
            createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización', readOnly: true }
          }
        },
        UnidadMedidaInput: {
          type: 'object',
          required: ['categoria', 'udm'],
          properties: {
            categoria: { type: 'string', description: 'Categoría de la unidad de medida', example: 'Volumen' },
            udm: { type: 'string', description: 'Unidad de medida', example: 'Lt' }
          }
        },
        Almacen: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID generado por MongoDB', readOnly: true },
            descripcion: { type: 'string', description: 'Descripción del almacén', example: 'Almacén Principal' },
            ubicacion: { type: 'string', description: 'Ubicación del almacén', example: 'Zona A, Estante 10' },
            createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización', readOnly: true }
          }
        },
        AlmacenInput: {
          type: 'object',
          required: ['descripcion'],
          properties: {
            descripcion: { type: 'string', description: 'Descripción del almacén', example: 'Almacén Secundario' },
            ubicacion: { type: 'string', description: 'Ubicación del almacén (opcional)', example: 'Zona B, Estante 5' }
          }
        },
        Contacto: {
            type: 'object',
            properties: {
                _id: { type: 'string', readOnly: true },
                tipo: { type: 'string', enum: ['cliente', 'proveedor'] },
                identificacion: { type: 'string' },
                nombre: { type: 'string' },
                direccion: { type: 'string' },
                telefono: { type: 'string', nullable: true },
                correo_electronico: { type: 'string', format: 'email', nullable: true },
                createdAt: { type: 'string', format: 'date-time', readOnly: true },
                updatedAt: { type: 'string', format: 'date-time', readOnly: true }
            }
        },
        ContactoInput: {
            type: 'object',
            required: ['tipo', 'identificacion', 'nombre', 'direccion'],
            properties: {
                tipo: { type: 'string', enum: ['cliente', 'proveedor'] },
                identificacion: { type: 'string' },
                nombre: { type: 'string' },
                direccion: { type: 'string' },
                telefono: { type: 'string', nullable: true },
                correo_electronico: { type: 'string', format: 'email', nullable: true, description: 'Debe ser un correo válido si se proporciona.' }
            }
        },
        Producto: {
          type: 'object',
          properties: {
            _id: { type: 'string', readOnly: true },
            codigo: { type: 'string' },
            descripcion: { type: 'string' },
            unidad_medida: { $ref: '#/components/schemas/UnidadMedida' },
            almacen: { $ref: '#/components/schemas/Almacen' },
            stock_minimo: { type: 'number', minimum: 0 },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true }
          }
        },
        ProductoInput: {
          type: 'object',
          required: ['codigo', 'descripcion', 'unidad_medida', 'almacen', 'stock_minimo'],
          properties: {
            codigo: { type: 'string' },
            descripcion: { type: 'string' },
            unidad_medida: { type: 'string', description: 'ID de la Unidad de Medida existente' },
            almacen: { type: 'string', description: 'ID del Almacén existente' },
            stock_minimo: { type: 'number', minimum: 0, description: 'No puede ser negativo' }
          }
        },
        Registro: {
          type: 'object',
          properties: {
            _id: { type: 'string', readOnly: true },
            fecha: { type: 'string', format: 'date-time' },
            tipo: { type: 'string', enum: ['entrada', 'salida'] },
            almacen: { $ref: '#/components/schemas/Almacen' },
            codigo_articulo: { $ref: '#/components/schemas/Producto' },
            unidad_medida: { $ref: '#/components/schemas/UnidadMedida' },
            codigo_proveedor: { $ref: '#/components/schemas/Contacto', description: 'Presente si tipo es "entrada"' },
            entregado_a: { $ref: '#/components/schemas/Contacto', description: 'Presente si tipo es "salida"' },
            observaciones: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true }
          }
        },
        RegistroInput: {
          type: 'object',
          required: ['tipo', 'almacen', 'codigo_articulo', 'unidad_medida'],
          properties: {
            fecha: { type: 'string', format: 'date-time', description: 'Defaults to now if not provided. Use YYYY-MM-DDTHH:MM:SSZ' },
            tipo: { type: 'string', enum: ['entrada', 'salida'] },
            almacen: { type: 'string', description: 'ID del Almacén' },
            codigo_articulo: { type: 'string', description: 'ID del Producto' },
            unidad_medida: { type: 'string', description: 'ID de la Unidad de Medida' },
            codigo_proveedor: { type: 'string', description: 'ID del Contacto proveedor (obligatorio y debe ser tipo "proveedor" si el registro es "entrada")' },
            entregado_a: { type: 'string', description: 'ID del Contacto cliente (obligatorio y debe ser tipo "cliente" si el registro es "salida")' },
            observaciones: { type: 'string', nullable: true }
          }
        },
        ErrorResponse: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                statusCode: { type: 'integer', example: 500 },
                message: { type: 'string', example: 'Internal Server Error' }
            }
        },
        ValidationErrorResponse: {
            type: 'object',
            properties: {
                errors: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', example: 'field'},
                            value: { type: 'string', example: 'someValue'},
                            msg: { type: 'string', example: 'Validation error message' },
                            path: { type: 'string', example: 'fieldName' },
                            location: { type: 'string', example: 'body' }
                        }
                    }
                }
            }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    // explorer: true, // Adds a search bar
    // customCss: '.swagger-ui .topbar { display: none }' // Example: Hide the Swagger top bar
  }));
};
