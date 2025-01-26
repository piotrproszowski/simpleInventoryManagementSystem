export abstract class DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly type: string,
    public readonly aggregateId: string,
    public readonly data: Record<string, any>,
  ) {
    this.occurredAt = new Date();
  }
}
