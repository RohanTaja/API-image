const asyncHandler = require('express-async-handler');
const { Category, Image, User } = require('../models/associations');

// Get all public categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ 
    where: { isPublic: true },
    include: [
      { 
        model: User, 
        attributes: ['username'] // Include owner details
      }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: categories
  });
});

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const { name } = req.body;

  if (!name) {
    throw Object.assign(new Error('Category name is required'), { status: 400 });
  }

  const category = await Category.create({ 
    name, 
    isPublic: true, // Default value
    ownerId: req.userId // Set ownerId from authenticated user
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// Get a single category by ID
const getCategory = asyncHandler(async (req, res) => {
  const categoryId = parseInt(req.params.id, 10);
  if (isNaN(categoryId)) {
    throw Object.assign(new Error('Invalid category ID'), { status: 400 });
  }

  const category = await Category.findByPk(categoryId, {
    include: [
      { model: User, attributes: ['username'] }, // Include owner details
      { model: Image, include: [{ model: User, attributes: ['username'] }] } // Include associated images and their owners
    ]
  });

  if (!category) {
    throw Object.assign(new Error('Category not found'), { status: 404 });
  }

  res.status(200).json({
    success: true,
    message: 'Category retrieved successfully',
    data: category
  });
});

// Update a category
const updateCategory = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const categoryId = parseInt(req.params.id, 10);
  if (isNaN(categoryId)) {
    throw Object.assign(new Error('Invalid category ID'), { status: 400 });
  }

  const category = await Category.findByPk(categoryId);

  if (!category || category.ownerId !== req.userId) {
    throw Object.assign(new Error('Category not found or unauthorized'), { status: 404 });
  }

  const { name } = req.body;

  if (name) category.name = name;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

// Delete a category
const deleteCategory = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const categoryId = parseInt(req.params.id, 10);
  if (isNaN(categoryId)) {
    throw Object.assign(new Error('Invalid category ID'), { status: 400 });
  }

  const category = await Category.findByPk(categoryId);

  if (!category || category.ownerId !== req.userId) {
    throw Object.assign(new Error('Category not found or unauthorized'), { status: 404 });
  }

  await category.destroy();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// Add an image to a category
const addImageToCategory = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const categoryId = parseInt(req.params.id, 10);
  if (isNaN(categoryId)) {
    throw Object.assign(new Error('Invalid category ID'), { status: 400 });
  }

  const category = await Category.findByPk(categoryId);

  if (!category || category.ownerId !== req.userId) {
    throw Object.assign(new Error('Category not found or unauthorized'), { status: 404 });
  }

  const { imageId } = req.body;
  const parsedImageId = parseInt(imageId, 10);

  if (!imageId || isNaN(parsedImageId)) {
    throw Object.assign(new Error('Valid image ID is required'), { status: 400 });
  }

  const image = await Image.findByPk(parsedImageId);

  if (!image) {
    throw Object.assign(new Error('Image not found'), { status: 404 });
  }

  await category.addImage(parsedImageId); // Use integer ID directly

  res.status(200).json({
    success: true,
    message: 'Image added to category successfully'
  });
});

// Remove an image from a category
const removeImageFromCategory = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const categoryId = parseInt(req.params.id, 10);
  const imageId = parseInt(req.params.imageId, 10);

  if (isNaN(categoryId) || isNaN(imageId)) {
    throw Object.assign(new Error('Invalid category or image ID'), { status: 400 });
  }

  const category = await Category.findByPk(categoryId);

  if (!category || category.ownerId !== req.userId) {
    throw Object.assign(new Error('Category not found or unauthorized'), { status: 404 });
  }

  const image = await Image.findByPk(imageId);
  if (!image) {
    throw Object.assign(new Error('Image not found'), { status: 404 });
  }

  const hasImage = await category.hasImage(imageId);
  if (!hasImage) {
    throw Object.assign(new Error('Image not found in this category'), { status: 404 });
  }

  await category.removeImage(imageId); // Use integer ID directly

  res.status(200).json({
    success: true,
    message: 'Image removed from category successfully'
  });
});

module.exports = { 
  getCategories, 
  createCategory, 
  getCategory, 
  updateCategory, 
  deleteCategory, 
  addImageToCategory, 
  removeImageFromCategory 
};