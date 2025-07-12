export default class Payment {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly processor: number | null = null,
    public readonly requestedAt: Date = new Date()
  ) {}
}
