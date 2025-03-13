
const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  createCategory, 
  getCategory, 
  updateCategory, 
  deleteCategory, 
  addImageToCategory, 
  removeImageFromCategory 
} = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body } = require('express-validator');

router.get('/categories', getCategories);
router.post('/categories', authenticate, validate([
  body('name').trim().notEmpty()
]), createCategory);
router.get('/categories/:id', getCategory);
router.put('/categories/:id', authenticate, validate([
  body('name').optional().trim().notEmpty()
]), updateCategory);
router.delete('/categories/:id', authenticate, deleteCategory);
router.post('/categories/:id/images', authenticate, validate([
  body('imageId').notEmpty()
]), addImageToCategory);
router.delete('/categories/:id/images/:imageId', authenticate, removeImageFromCategory);

module.exports = router;