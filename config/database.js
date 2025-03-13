// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// config/database.js (temporary change)
const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: console.log // Enable for debugging
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`${process.env.NODE_ENV === 'test' ? 'SQLite' : 'PostgreSQL'} connected`);
  } catch (error) {
    console.error(`${process.env.NODE_ENV === 'test' ? 'SQLite' : 'PostgreSQL'} connection error:`, error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };