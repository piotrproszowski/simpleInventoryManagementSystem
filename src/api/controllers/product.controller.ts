import { Request, Response } from "express";
import { ProductCommandHandler } from "../../write/handlers/product.command-handler";
import { ProductQueryHandler } from "../../read/handlers/product.handler";
import { CreateProductCommand } from "../../write/commands/product/create-product.command";
import { UpdateProductStockCommand } from "../../write/commands/product/update-stock.command";
import { Logger } from "../../shared/logger";
import { DomainError } from "../../shared/errors/domain.error";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../middleware/async.handler";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly commandHandler: ProductCommandHandler,
    private readonly queryHandler: ProductQueryHandler,
  ) {}

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await this.queryHandler.getAll(page, limit);
    res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await this.queryHandler.getById(req.params.id);
    if (!product) {
      throw new NotFoundError("Product");
    }
    res.json(product);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = uuidv4();
    const command = new CreateProductCommand(
      id,
      req.body.name,
      req.body.description,
      req.body.price,
      req.body.stock,
    );

    await this.commandHandler.handle(command);
    res.status(201).json({ id });
  });

  updateStock = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const command = new UpdateProductStockCommand(
        req.params.id,
        req.body.quantity,
      );

      await this.commandHandler.handle(command);
      res.status(200).json({ message: "Stock updated successfully" });
    },
  );
}
