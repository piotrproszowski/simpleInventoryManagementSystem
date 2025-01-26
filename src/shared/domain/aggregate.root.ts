import { DomainEvent } from "./domain.event";

export abstract class AggregateRoot {
  private _version: number = 0;
  private _events: DomainEvent[] = [];

  get version(): number {
    return this._version;
  }

  get uncommittedEvents(): DomainEvent[] {
    return [...this._events];
  }

  protected applyEvent(event: DomainEvent): void {
    this.handleEvent(event);
    this._events.push(event);
    this._version++;
  }

  private handleEvent(event: DomainEvent): void {
    const handler = this.getEventHandler(event);
    if (handler) {
      handler.call(this, event);
    }
  }

  private getEventHandler(event: DomainEvent): Function | undefined {
    const handlerName = `on${event.type}`;
    const handler = (this as any)[handlerName];
    return handler && typeof handler === "function" ? handler : undefined;
  }

  clearEvents(): void {
    this._events = [];
  }
}
