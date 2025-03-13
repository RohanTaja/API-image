// server.js
require('dotenv').config();
const app = require('./app');
const { connectDB, sequelize } = require('./config/database');
const { setupAssociations } = require('./models/associations');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    console.log('Database connected successfully');

    setupAssociations();
    console.log('Associations set up');

    await sequelize.sync({ alter: true }); // Change: Revert to alter
    console.log('Database schema synced successfully');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();