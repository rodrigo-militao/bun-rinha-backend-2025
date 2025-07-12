import Payment from "../entity/payment";

export default interface PaymentRepository {
  getSummary(from: Date, to: Date): Promise<{ processor: number, total_requests: number, total_amount: number }[]>;
  save(payment: Payment): Promise<void>;
}