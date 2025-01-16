/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the product
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           description: Product price
 *         stock:
 *           type: integer
 *           description: Current stock level
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateProduct:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 50
 *         description:
 *           type: string
 *           maxLength: 50
 *         price:
 *           type: number
 *           minimum: 0
 *         stock:
 *           type: integer
 *           minimum: 0
 */
