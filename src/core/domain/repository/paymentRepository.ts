import Payment from "../entity/payment";

export default interface PaymentRepository {
  getAllPayments():  Promise<Payment[]>;
  save(payment: Payment): Promise<void>;

  // Admin
  purgePayments(): Promise<void>;
}