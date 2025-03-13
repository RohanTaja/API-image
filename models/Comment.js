// models/Comment.js (assumed)
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  content: { // Note: The error mentions "content", not "text"
    type: DataTypes.STRING,
    allowNull: false
  },
  ImageId: { // Sequelize capitalizes foreign keys by convention
    type: DataTypes.INTEGER,
    allowNull: false
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { timestamps: true });

module.exports = Comment;