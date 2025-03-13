const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models/associations');
const { Op } = require('sequelize');

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Change 1: Input validation
  if (!username || !email || !password) {
    throw Object.assign(new Error('Username, email, and password are required'), { status: 400 });
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw Object.assign(new Error('User already exists'), { status: 400 });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ username, email, password: hashedPassword });
  const token = jwt.sign({ userId: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  res.status(201).json({ id: user.id, username: user.username, token, refreshToken });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Change 2: Input validation
  if (!email || !password) {
    throw Object.assign(new Error('Email and password are required'), { status: 400 });
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const token = jwt.sign({ userId: user.id, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  res.json({ id: user.id, username: user.username, email: user.email, token, refreshToken }); // Change 3: Include more user info
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw Object.assign(new Error('Refresh token required'), { status: 401 });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    }
    const token = jwt.sign({ userId: user.id, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw Object.assign(new Error('Email is required'), { status: 400 });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  await user.update({ resetToken, resetTokenExpires: Date.now() + 3600000 }); // 1 hour
  // TODO: Send resetToken via email (implement email service)
  res.json({ message: 'Password reset initiated', resetToken }); // For testing; remove in production
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw Object.assign(new Error('Token and new password are required'), { status: 400 });
  }

  const user = await User.findOne({ 
    where: { 
      resetToken: token, 
      resetTokenExpires: { [Op.gt]: Date.now() } 
    }
  });

  if (!user) {
    throw Object.assign(new Error('Invalid or expired token'), { status: 400 });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await user.update({ 
    password: hashedPassword, 
    resetToken: null, 
    resetTokenExpires: null 
  });

  res.json({ message: 'Password reset successful' });
});

const getProfile = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  const user = await User.findByPk(req.userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  res.json({ id: user.id, username: user.username, email: user.email, bio: user.bio });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  const user = await User.findByPk(req.userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const { username, email, bio } = req.body;
  if (!username && !email && !bio) {
    throw Object.assign(new Error('No valid fields provided for update'), { status: 400 });
  }

  const updatedFields = {};
  if (username) updatedFields.username = username;
  if (email) updatedFields.email = email;
  if (bio) updatedFields.bio = bio;

  await user.update(updatedFields);
  res.json({ id: user.id, username: user.username, email: user.email, bio: user.bio });
});

module.exports = { register, login, refreshToken, forgotPassword, resetPassword, getProfile, updateProfile };