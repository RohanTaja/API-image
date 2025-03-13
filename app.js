const express = require('express');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./docs/swagger-output.json'); // Use the generated file

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api', require('./routes/authRoutes'));        // Mount auth routes at /api/auth
app.use('/api', require('./routes/imageRoutes'));     // Mount image routes at /api/images
app.use('/api', require('./routes/categoryRoutes')); // Mount category routes at /api/categories
app.use('/api', require('./routes/socialRoutes'));    // Mount social routes at /api/images

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(errorHandler);

module.exports = app;