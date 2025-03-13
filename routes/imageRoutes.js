const express = require('express');
const router = express.Router();
const { 
  getImages, 
  getImage, 
  uploadImage, 
  updateImage, 
  deleteImage, 
  getUserImages 
} = require('../controllers/imageController');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate, imageValidation } = require('../middleware/validation');

router.get('/images', getImages);
router.get('/images/:id', getImage);
router.post('/images', authenticate, upload.single('image'),/*  validate(imageValidation), */ uploadImage);
router.put('/images/:id', authenticate, /* validate(imageValidation), */ updateImage);
router.delete('/images/:id', authenticate, deleteImage);
router.get('/users/:userId/images', getUserImages);

module.exports = router;