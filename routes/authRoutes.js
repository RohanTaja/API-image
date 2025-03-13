
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshToken, 
  forgotPassword, 
  resetPassword, 
  getProfile, 
  updateProfile 
} = require('../controllers/authController');
const { validate, userValidation } = require('../middleware/validation');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');

router.post('/auth/register', validate(userValidation), register);
router.post('/auth/login', validate([
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
]), login);
router.post('/auth/refresh', refreshToken);
router.post('/auth/forgot-password', validate([
  body('email').isEmail().normalizeEmail()
]), forgotPassword);
router.post('/auth/reset-password', validate([
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 })
]), resetPassword);
router.get('/auth/profile', authenticate, getProfile);
router.put('/auth/profile', authenticate, validate([
  body('username').optional().trim().isLength({ min: 3 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('bio').optional().trim()
]), updateProfile);

module.exports = router;