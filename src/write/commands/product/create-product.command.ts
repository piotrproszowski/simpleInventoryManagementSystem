import { Command } from "../types/command.type";

export class CreateProductCommand implements Command {
  readonly type = "CreateProduct";

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}
}
