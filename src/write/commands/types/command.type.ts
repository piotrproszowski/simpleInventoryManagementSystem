export interface Command {
  type: string;
}

export interface CommandHandler<T extends Command> {
  handle(command: T): Promise<void>;
}
