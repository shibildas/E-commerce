const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(64).required(),

  password: Joi.string().required(),

  cPassword: Joi.ref("password"),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "in"] } }),
  mobile: Joi.number().required(),
  role: Joi.string()

}).with("password", "cPassword");

module.exports = { registerSchema };
