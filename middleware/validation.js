const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};

const userValidation = [
  body('username').trim().notEmpty().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const imageValidation = [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('tags').optional().isArray()
];

module.exports = { validate, userValidation, imageValidation };