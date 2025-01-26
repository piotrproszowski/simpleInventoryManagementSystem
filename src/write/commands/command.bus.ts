import { Command, CommandHandler } from "./types/command.type";
import { Logger } from "../../shared/logger";

export class CommandBus {
  private handlers = new Map<string, CommandHandler<Command>>();
  private readonly logger = new Logger(CommandBus.name);

  register<T extends Command>(
    commandType: string,
    handler: CommandHandler<T>,
  ): void {
    this.handlers.set(commandType, handler as CommandHandler<Command>);
  }

  async execute<T extends Command>(command: T): Promise<void> {
    const handler = this.handlers.get(command.type);

    if (!handler) {
      this.logger.error(`No handler registered for command: ${command.type}`, {
        commandType: command.type,
      });
      throw new Error(`No handler registered for command: ${command.type}`);
    }

    try {
      await handler.handle(command);
    } catch (error) {
      this.logger.error(`Error executing command ${command.type}:`, error);
      throw error;
    }
  }
}

export const commandBus = new CommandBus();
