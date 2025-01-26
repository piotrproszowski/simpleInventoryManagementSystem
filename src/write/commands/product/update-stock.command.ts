import { Command } from "../types/command.type";

export class UpdateProductStockCommand implements Command {
  readonly type = "UpdateStock";

  constructor(
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}
