// utils/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500; // Use custom status or default to 500
  const message = err.message || 'Internal Server Error';

  // Log the error for debugging (optional)
  console.error(`Error: ${message} (Status: ${status})`);

  // Send JSON response
  res.status(status).json({ message });
};

module.exports = errorHandler;