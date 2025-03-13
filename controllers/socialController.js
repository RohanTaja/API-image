const asyncHandler = require('express-async-handler');
const { Image, Comment, User } = require('../models/associations');

// Like an image
const likeImage = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const imageId = parseInt(req.params.id, 10);
  if (isNaN(imageId)) {
    throw Object.assign(new Error('Invalid image ID'), { status: 400 });
  }

  const image = await Image.findByPk(imageId);
  if (!image) {
    throw Object.assign(new Error('Image not found'), { status: 404 });
  }

  await image.addLiker(req.userId);
  res.status(200).json({
    success: true,
    message: 'Image liked successfully'
  });
});

// Unlike an image
const unlikeImage = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const imageId = parseInt(req.params.id, 10);
  if (isNaN(imageId)) {
    throw Object.assign(new Error('Invalid image ID'), { status: 400 });
  }

  const image = await Image.findByPk(imageId);
  if (!image) {
    throw Object.assign(new Error('Image not found'), { status: 404 });
  }

  await image.removeLiker(req.userId);
  res.status(200).json({
    success: true,
    message: 'Image unliked successfully'
  });
});

// Get comments for an image
const getComments = asyncHandler(async (req, res) => {
  const imageId = parseInt(req.params.id, 10);
  if (isNaN(imageId)) {
    throw Object.assign(new Error('Invalid image ID'), { status: 400 });
  }

  const comments = await Comment.findAll({
    where: { ImageId: imageId },
    include: [{ model: User, attributes: ['username'] }]
  });
  res.status(200).json({
    success: true,
    message: 'Comments retrieved successfully',
    data: comments
  });
});

// Add a comment to an image
const addComment = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const imageId = parseInt(req.params.id, 10);
  if (isNaN(imageId)) {
    throw Object.assign(new Error('Invalid image ID'), { status: 400 });
  }

  const { content } = req.body;
  if (!content) {
    throw Object.assign(new Error('Comment content is required'), { status: 400 });
  }

  const comment = await Comment.create({
    content,
    ImageId: imageId,
    UserId: req.userId
  });
  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: comment
  });
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const commentId = parseInt(req.params.commentId, 10);
  if (isNaN(commentId)) {
    throw Object.assign(new Error('Invalid comment ID'), { status: 400 });
  }

  const comment = await Comment.findByPk(commentId);
  if (!comment || comment.UserId !== req.userId) {
    throw Object.assign(new Error('Comment not found or unauthorized'), { status: 404 });
  }

  const { content } = req.body;
  if (!content) {
    throw Object.assign(new Error('Comment content is required'), { status: 400 });
  }

  await comment.update({ content });
  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: comment
  });
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  const commentId = parseInt(req.params.commentId, 10);
  if (isNaN(commentId)) {
    throw Object.assign(new Error('Invalid comment ID'), { status: 400 });
  }

  const comment = await Comment.findByPk(commentId);
  if (!comment || comment.UserId !== req.userId) {
    throw Object.assign(new Error('Comment not found or unauthorized'), { status: 404 });
  }

  await comment.destroy();
  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

module.exports = { likeImage, unlikeImage, getComments, addComment, updateComment, deleteComment };