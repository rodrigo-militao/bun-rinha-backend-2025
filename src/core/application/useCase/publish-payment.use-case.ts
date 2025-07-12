import PaymentPublisher from "../interfaces/paymentPublisher";

export default class PublishPaymentUseCase {
  constructor(private publisher: PaymentPublisher) {}

  async execute(amount: number, correlationId: string) {
    await this.publisher.publish({ amount, correlationId });
  }
}
