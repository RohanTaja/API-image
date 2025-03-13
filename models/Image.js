// models/Image.js
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  originalUrl: { type: DataTypes.STRING, allowNull: false },
  thumbnailUrl: { type: DataTypes.STRING, allowNull: false },
  ownerId: {
    type: DataTypes.INTEGER, // Foreign key to Users.id
    allowNull: false
  },
  tags: {
    type: DataTypes.STRING, // Changed from ARRAY to STRING
    allowNull: true,
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', value ? JSON.stringify(value) : null);
    }
  },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = Image;