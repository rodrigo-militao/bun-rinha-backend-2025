import PaymentRepository from "../../domain/repository/paymentRepository";

interface PaymentSummary {
  default: {
    totalRequests: number;
    totalAmount: number;
  };
  fallback: {
    totalRequests: number;
    totalAmount: number;
  };
}

export default class GetPaymentSummaryUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async execute(from: string | undefined, to: string | undefined): Promise<PaymentSummary> {
    const allPayments = await this.paymentRepository.getAllPayments();

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate && toDate && fromDate > toDate) {
      throw new Error("A data de início não pode ser maior que a data de fim.");
    }

    let defaultCount = 0;
    let defaultAmount = 0;
    let fallbackCount = 0;
    let fallbackAmount = 0;

    for (const payment of allPayments) {
      if (fromDate && payment.requestedAt < fromDate) {
        continue;
      }
      if (toDate && payment.requestedAt > toDate) {
        continue;
      }

      switch (payment.processor) {
        case "default":
          defaultCount++;
          defaultAmount += payment.amount;
          break;
        case "fallback":
          fallbackCount++;
          fallbackAmount += payment.amount;
          break;
      }
    }
    return {
      default: {
        totalRequests: defaultCount,
        totalAmount: defaultAmount,
      },
      fallback: {
        totalRequests: fallbackCount,
        totalAmount: fallbackAmount,
      },
    };
  }
}