const express = require('express');
const router = express.Router();
const { 
  likeImage, 
  unlikeImage, 
  getComments, 
  addComment, 
  updateComment, 
  deleteComment 
} = require('../controllers/socialController');
const authenticate = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body } = require('express-validator');

router.post('/images/:id/like', authenticate, likeImage);
router.delete('/images/:id/like', authenticate, unlikeImage);
router.get('/images/:id/comments', getComments);
router.post('/images/:id/comments', authenticate, validate([
  body('content').trim().notEmpty().withMessage('Comment content is required') // Changed from text to content
]), addComment);
router.put('/images/:id/comments/:commentId', authenticate, validate([
  body('content').trim().notEmpty().withMessage('Comment content is required') // Changed from text to content
]), updateComment);
router.delete('/images/:id/comments/:commentId', authenticate, deleteComment);

module.exports = router;