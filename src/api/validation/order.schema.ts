import Joi from "joi";

const orderProductSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    "string.empty": "Product ID is required",
    "string.guid": "Invalid product ID format - must be a valid UUID",
  }),

  quantity: Joi.number().positive().precision(2).required().messages({
    "number.base": "Quantity must be a number",
    "number.positive": "Quantity must be a positive number",
    "any.required": "Quantity is required",
  }),
}).required();

export const createOrderSchema = Joi.object({
  customerId: Joi.string().uuid().required().messages({
    "string.empty": "Customer ID is required",
    "string.guid": "Invalid customer ID format - must be a valid UUID",
  }),

  products: Joi.array().items(orderProductSchema).min(1).required().messages({
    "array.base": "Products must be an array",
    "array.min": "Order must contain at least one product",
    "any.required": "Products are required",
  }),
});

export const getOrderSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.empty": "Order ID is required",
    "string.guid": "Invalid order ID format - must be a valid UUID",
  }),
});
