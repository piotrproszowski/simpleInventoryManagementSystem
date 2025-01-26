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

  price: Joi.number().precision(2).required().greater(0).messages({
    "number.greater": "Price must be greater than 0",
    "number.base": "Price must be a number",
    "number.unsafe": "Price is invalid",
    "number.precision": "Price can't have more than 2 decimal places",
  }),

  stock: Joi.number().precision(3).required().min(0).messages({
    "number.min": "Stock cannot be negative",
    "number.base": "Stock must be a number",
    "number.unsafe": "Stock quantity is invalid",
    "number.precision": "Stock quantity can't have more than 3 decimal places",
  }),
});

export const updateStockSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.empty": "Product ID is required",
    "string.guid": "Invalid product ID format - must be a valid UUID",
  }),
  quantity: Joi.number().precision(3).required().messages({
    "number.base": "Quantity must be a number",
    "any.required": "Quantity is required",
    "number.unsafe": "Quantity is invalid",
    "number.precision": "Quantity can't have more than 3 decimal places",
  }),
});
