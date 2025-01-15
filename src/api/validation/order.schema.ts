import Joi from "joi";

const orderProductSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
}).required();

export const createOrderSchema = Joi.object({
  customerId: Joi.string().required().messages({
    "string.empty": "Customer ID is required",
    "any.required": "Customer ID is required",
  }),

  products: Joi.array().items(orderProductSchema).min(1).required().messages({
    "array.base": "Products must be an array",
    "array.min": "Order must contain at least one product",
    "any.required": "Products are required",
  }),
});

export const getOrderSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Order ID is required",
    "any.required": "Order ID is required",
  }),
});
