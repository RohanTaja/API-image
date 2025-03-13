const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Categories are public by default
    allowNull: false
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Every category must have an owner
    references: {
      model: 'Users', // References the User model
      key: 'id'
    }
  }
}, { timestamps: true });

module.exports = Category;