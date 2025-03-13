const Sequelize = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Image = require('./Image');
const Category = require('./Category');
const Comment = require('./Comment');

const ImageCategories = sequelize.define('ImageCategories', {
  id: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  ImageId: {
    type: Sequelize.DataTypes.INTEGER, // Foreign key to Images.id
    allowNull: false,
    references: { model: Image, key: 'id' }
  },
  CategoryId: {
    type: Sequelize.DataTypes.INTEGER, // Foreign key to Categories.id
    allowNull: false,
    references: { model: Category, key: 'id' }
  }
}, { timestamps: false });

const setupAssociations = () => {
  // User has many Images
  User.hasMany(Image, { foreignKey: 'ownerId' });
  Image.belongsTo(User, { foreignKey: 'ownerId' });

  // User has many Categories
  User.hasMany(Category, { foreignKey: 'ownerId' });
  Category.belongsTo(User, { foreignKey: 'ownerId' });

  // Image belongs to many Categories (and vice versa)
  Image.belongsToMany(Category, { through: ImageCategories, foreignKey: 'ImageId' });
  Category.belongsToMany(Image, { through: ImageCategories, foreignKey: 'CategoryId' });

  // Image belongs to many Users (likes)
  Image.belongsToMany(User, { through: 'Likes', as: 'likers', foreignKey: 'ImageId' });
User.belongsToMany(Image, { through: 'Likes', as: 'likedImages', foreignKey: 'UserId' });

  // Image has many Comments
  Image.hasMany(Comment);
  Comment.belongsTo(Image);

  // User has many Comments
  User.hasMany(Comment);
  Comment.belongsTo(User);

  // User follows many Users
  User.belongsToMany(User, { 
    as: 'followers',
    through: 'Followers',
    foreignKey: 'followingId'
  });
  User.belongsToMany(User, { 
    as: 'following',
    through: 'Followers',
    foreignKey: 'followerId'
  });
};

module.exports = { User, Image, Category, Comment, ImageCategories, setupAssociations };