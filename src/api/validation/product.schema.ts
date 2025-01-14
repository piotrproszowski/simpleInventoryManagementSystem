import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required().max(50).trim().messages({
    "string.max": "Name cannot exceed 50 characters",
    "string.empty": "Name is required",
  }),

  description: Joi.string().required().max(50).trim().messages({
    "string.max": "Description cannot exceed 50 characters",
    "string.empty": "Description is required",
  }),

  price: Joi.number().required().greater(0).messages({
    "number.greater": "Price must be greater than 0",
    "number.base": "Price must be a number",
  }),

  stock: Joi.number().required().min(0).messages({
    "number.min": "Stock cannot be negative",
    "number.base": "Stock must be a number",
  }),
});

export const updateStockSchema = Joi.object({
  quantity: Joi.number().required().messages({
    "number.base": "Quantity must be a number",
    "any.required": "Quantity is required",
  }),
});
