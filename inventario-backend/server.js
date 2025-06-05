require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Inventory API');
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const dbURI = process.env.NODE_ENV === 'test'
                  ? process.env.MONGODB_URI_TEST
                  : process.env.MONGODB_URI;

    if (!dbURI) {
      throw new Error(`MongoDB URI not found. Ensure ${process.env.NODE_ENV === 'test' ? 'MONGODB_URI_TEST' : 'MONGODB_URI'} is set.`);
    }

    await mongoose.connect(dbURI);
    console.log(`MongoDB connected successfully to ${dbURI}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

mongoose.connection.on('error', err => {
  console.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connection established.');
});

// Routes
const unidadesMedidaRoutes = require('./routes/unidadesMedida');
const almacenesRoutes = require('./routes/almacenes');
const contactosRoutes = require('./routes/contactos');
const productosRoutes = require('./routes/productos');
const registrosRoutes = require('./routes/registros');

app.use('/api/unidades_medidas', unidadesMedidaRoutes);
app.use('/api/almacenes', almacenesRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/registros', registrosRoutes);

// Swagger Documentation Setup
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  // const port = process.env.PORT || 3000; // port is already defined above
  server = app.listen(port, () => { // Use the port variable defined at the top of the file
    console.log(`Server listening on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = { app, server }; // Export both for flexibility
