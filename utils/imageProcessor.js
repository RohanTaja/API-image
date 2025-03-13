// utils/imageProcessor.js
const sharp = require('sharp');
const path = require('path');

const processImage = async (filePath) => {
  try {
    const thumbnailPath = path.join('uploads', `thumb-${Date.now()}.jpg`);
    await sharp(filePath)
      .resize(200, 200)
      .toFile(thumbnailPath);
    return { thumbnailPath }; // Ensure no id field is included
  } catch (error) {
    throw Object.assign(new Error('Failed to process image'), { status: 500, details: error.message });
  }
};

module.exports = { processImage };