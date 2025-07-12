import Payment from "../../domain/entity/payment";
import PaymentRepository from "../../domain/repository/paymentRepository";


class ProcessPaymentUseCase {
  private readonly DEFAULT_PROCESSOR = 0;
  private readonly FALLBACK_PROCESSOR = 1;

  constructor(
    private paymentRepository: PaymentRepository,
    private urlDefault: string,
    private urlFallback: string
  ) {}

  public async execute(message: string): Promise<void> {
    const defaultProcessed = await this._tryProcess(message, this.urlDefault, this.DEFAULT_PROCESSOR);
    if (defaultProcessed) {
      await this._savePayment(message, this.DEFAULT_PROCESSOR);
      return;
    }

    const fallbackProcessed = await this._tryProcess(message, this.urlFallback, this.FALLBACK_PROCESSOR);
    if (fallbackProcessed) {
      await this._savePayment(message, this.FALLBACK_PROCESSOR);
      return;
    }
  }

  private async _savePayment(message: string, processor: number): Promise<void> {
    try {
      const { amount, correlationId } = JSON.parse(message);
      const payment = new Payment(correlationId, amount, processor);
      await this.paymentRepository.save(payment);
    } catch (error) {
      console.error('Erro ao salvar pagamento no banco de dados:', error);
    }
  }

  private async _tryProcess(message: string, url: string, processor: number): Promise<boolean> {
    try {
      const res = await fetch(url + '/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: message,
      });

      return res.ok;

    } catch (e) {
      // console.error(`Erro ao processar pagamento no serviço ${processor === 0 ? 'padrão' : 'fallback'}:`, e);
      return false;
    }
  }
}

export default ProcessPaymentUseCase;
