/**
 * Input Validation Middleware (Joi)
 */

const Joi = require('joi');

// Password must be 8+ chars, 1 uppercase, 1 number, 1 special char
const passwordRules = Joi.string()
  .min(8)
  .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/)
  .required()
  .messages({
    'string.pattern.base': 'Password must have 8+ chars, 1 uppercase, 1 number, and 1 special character',
  });

const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email:    Joi.string().email().required(),
    password: passwordRules,
  }),

  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  verify2FA: Joi.object({
    token:  Joi.string().length(6).pattern(/^\d+$/).required(),
    userId: Joi.string().required(),
  }),

  addAccount: Joi.object({
    platform: Joi.string().valid(
      'Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Nintendo',
      'Riot Games', 'Battle.net', 'Origin', 'Ubisoft Connect', 'GOG'
    ).required(),
    username: Joi.string().min(2).max(50).required(),
    notes:    Joi.string().max(500).optional(),
  }),

};

/**
 * Returns Express middleware that validates req.body against a named schema
 */
const validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) return next();

  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => d.message),
    });
  }
  next();
};

module.exports = { validate };
