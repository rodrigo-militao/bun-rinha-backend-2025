import PaymentRepository from "../../domain/repository/paymentRepository";

export default class PurgePaymentsUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async execute(): Promise<void> {
    await this.paymentRepository.purgePayments();
  }
}
