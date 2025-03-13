const asyncHandler = require('express-async-handler');
const { Image, User, Category } = require('../models/associations');
const { processImage } = require('../utils/imageProcessor');
const { Op } = require('sequelize');

const getImages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, tags } = req.query;
  const where = { isPublic: true };
  if (category) where['$Categories.id$'] = parseInt(category, 10);
  if (tags) where.tags = { [Op.contains]: tags.split(',') };

  const { count, rows: images } = await Image.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['username'] }, { model: Category }],
    limit: parseInt(limit),
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    message: 'Images retrieved successfully',
    data: {
      images,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

const getImage = asyncHandler(async (req, res) => {
  const image = await Image.findByPk(parseInt(req.params.id, 10), {
    include: [{ model: User, attributes: ['username'] }, { model: Category }]
  });
  if (!image) {
    throw Object.assign(new Error('Image not found'), { status: 404 });
  }
  res.status(200).json({
    success: true,
    message: 'Image retrieved successfully',
    data: image
  });
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  if (!req.file) {
    throw Object.assign(new Error('No image file provided'), { status: 400 });
  }

  const { title, description, tags, categories } = req.body;
  console.log('Step 1: Starting image processing');
  const imageData = await processImage(req.file.path);
  console.log('Step 2: imageData:', imageData);
  if (!imageData || !imageData.thumbnailPath) {
    throw Object.assign(new Error('Failed to generate thumbnail'), { status: 500 });
  }

  const { thumbnailPath, ...safeImageData } = imageData;
  console.log('Step 3: Creating image with data:', {
    title,
    description,
    originalUrl: req.file.path,
    thumbnailUrl: thumbnailPath,
    ownerId: req.userId,
    tags: tags ? tags.split(',') : [],
    ...safeImageData
  });

  const image = await Image.create({
    title,
    description: description || null, // Optional field
    originalUrl: req.file.path,
    thumbnailUrl: thumbnailPath,
    ownerId: req.userId,
    tags: tags ? tags.split(',') : [], // Array will be JSON-serialized by model
    ...safeImageData // Spread any additional fields from processImage
  });

  if (categories) {
    const categoryIds = Array.isArray(categories)
      ? categories.map(id => parseInt(id, 10))
      : [parseInt(categories, 10)]; // Handle single ID or comma-separated string
    await image.addCategories(categoryIds.filter(id => !isNaN(id)));
  }

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: image
  });
});

const updateImage = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  const image = await Image.findByPk(parseInt(req.params.id, 10));
  if (!image || image.ownerId !== req.userId) {
    throw Object.assign(new Error('Image not found or unauthorized'), { status: 404 });
  }

  const { title, description, tags, categories } = req.body;
  await image.update({ title, description, tags: tags ? tags.split(',') : [] });

  if (categories) {
    const categoryIds = categories.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    await image.setCategories(categoryIds);
  }
  res.status(200).json({
    success: true,
    message: 'Image updated successfully',
    data: image
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  const image = await Image.findByPk(parseInt(req.params.id, 10));
  if (!image || image.ownerId !== req.userId) {
    throw Object.assign(new Error('Image not found or unauthorized'), { status: 404 });
  }

  await image.destroy();
  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
});

const getUserImages = asyncHandler(async (req, res) => {
  const images = await Image.findAll({
    where: { ownerId: parseInt(req.params.userId, 10) },
    include: [{ model: User, attributes: ['username'] }, { model: Category }]
  });
  res.status(200).json({
    success: true,
    message: 'User images retrieved successfully',
    data: images
  });
});

module.exports = { getImages, getImage, uploadImage, updateImage, deleteImage, getUserImages };