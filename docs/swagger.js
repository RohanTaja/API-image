const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Image Gallery API',
    version: '1.0.0',
    description: 'API for managing images, categories, and social interactions',
  },
  host: `localhost:${process.env.PORT || 3000}`,
  schemes: ['http'],
  basePath: '/api',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
    },
  },
};

const outputFile = './docs/swagger-output.json';
const authRoutes = ['./routes/authRoutes.js'];
const imageRoutes = ['./routes/imageRoutes.js'];
const categoryRoutes = ['./routes/categoryRoutes.js'];
const socialRoutes = ['./routes/socialRoutes.js'];


// Generate the Swagger spec when this file is run
swaggerAutogen(outputFile, [...authRoutes, ...imageRoutes, ...categoryRoutes, ...socialRoutes], doc).then(() => {
  console.log('Swagger spec generated successfully');
});