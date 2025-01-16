import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required().max(50),
  description: Joi.string().required().max(50),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().max(50),
  description: Joi.string().max(50),
  price: Joi.number().positive(),
  stock: Joi.number().integer().min(0),
}).min(1);

export const restockProductSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
});

export const sellProductSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
});
