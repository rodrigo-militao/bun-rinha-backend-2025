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
    if (!from) {
      from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 horas atrás
    }
    if (!to) {
      to = new Date().toISOString();
    }
    if (new Date(from) > new Date(to)) {
      throw new Error("A data de início não pode ser maior que a data de fim.");
    }
    const summary = await this.paymentRepository.getSummary(new Date(from), new Date(to));

    const response: PaymentSummary = {
      default: { totalRequests: 0, totalAmount: 0 },
      fallback: { totalRequests: 0, totalAmount: 0 }
    };

    for (const row of summary) {
      if (row.processor === 0) {
        response.default.totalRequests = Number(row.total_requests);
        response.default.totalAmount = Number(row.total_amount);
      } else if (row.processor === 1) {
        response.fallback.totalRequests = Number(row.total_requests);
        response.fallback.totalAmount = Number(row.total_amount);
      }
    }

    return response;
  }
}