const Joi = require('joi');
const { ValidationError } = require('../middleware/errors');

const providerSchema = Joi.object({
  userSub: Joi.string().required(),
  providerName: Joi.string().required(),
  category: Joi.string().required(),
  availability: Joi.object().required(),
  timeSlotLength: Joi.number().integer().positive().required(),
  services: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    cost: Joi.number().positive().required()
  })).min(1).required(),
  searchId: Joi.string().required(),
  providerImage: Joi.string().required()
});

function validateProvider(req, res, next) {
  const { error } = providerSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }

  next();
}

module.exports = validateProvider;
