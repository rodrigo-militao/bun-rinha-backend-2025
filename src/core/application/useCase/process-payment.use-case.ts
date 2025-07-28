import Payment from "../../domain/entity/payment";
import PaymentRepository from "../../domain/repository/paymentRepository";


class ProcessPaymentUseCase {
  private readonly DEFAULT_PROCESSOR = "default";
  private readonly FALLBACK_PROCESSOR = "fallback";

  constructor(
    private paymentRepository: PaymentRepository,
    private urlDefault: string,
    private urlFallback: string
  ) {}

  public async execute(message: string): Promise<void> {
    const defaultProcessed = await this._tryProcess(message, this.urlDefault);
    if (defaultProcessed) {
      await this._savePayment(message, this.DEFAULT_PROCESSOR);
      return;
    }

    const fallbackProcessed = await this._tryProcess(message, this.urlFallback);
    if (fallbackProcessed) {
      await this._savePayment(message, this.FALLBACK_PROCESSOR);
      return;
    }
  }

  private async _savePayment(message: string, processor: string): Promise<void> {
    try {
      const { amount, correlationId } = JSON.parse(message);
      const payment = new Payment(correlationId, amount, processor);
      await this.paymentRepository.save(payment);
    } catch (error) {
      console.error('Erro ao salvar pagamento no banco de dados:', error);
    }
  }

  private async _tryProcess(message: string, url: string): Promise<boolean> {
    try {
      const res = await fetch(url + '/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: message,
      });

      return res.ok;

    } catch (e) {
      return false;
    }
  }
}

export default ProcessPaymentUseCase;
