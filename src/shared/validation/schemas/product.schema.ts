import Joi from "joi";

const priceStringToNumber = (value: string, helpers: Joi.CustomHelpers) => {
  if (typeof value === "number") return value;

  const normalizedPrice = value.replace(",", ".");
  const price = parseFloat(normalizedPrice);

  if (isNaN(price)) {
    return helpers.error("number.base");
  }

  return price;
};

export const createProductSchema = Joi.object({
  name: Joi.string().required().min(3).max(50).trim().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 50 characters",
  }),

  description: Joi.string().required().min(10).max(500).trim().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 500 characters",
  }),

  price: Joi.alternatives()
    .try(
      Joi.number().positive().precision(2),
      Joi.string().custom(priceStringToNumber),
    )
    .required()
    .messages({
      "number.base": "Price must be a valid number",
      "number.positive": "Price must be positive",
      "number.precision": "Price cannot have more than 2 decimal places",
      "any.required": "Price is required",
    }),

  stock: Joi.number().required().integer().min(0).messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock cannot be negative",
  }),
});

export const updateStockSchema = Joi.object({
  quantity: Joi.number().required().integer().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
  }),
});

export const productIdSchema = Joi.object({
  id: Joi.string().required().uuid().messages({
    "string.empty": "Product ID is required",
    "string.uuid": "Invalid product ID format",
  }),
});
