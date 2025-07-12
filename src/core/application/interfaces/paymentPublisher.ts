export default interface PaymentPublisher {
  publish(payload: { amount: number; correlationId: string }): Promise<void>;
}