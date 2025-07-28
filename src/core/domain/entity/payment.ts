export default class Payment {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly processor: string,
    public readonly requestedAt: Date = new Date()
  ) {}
}
