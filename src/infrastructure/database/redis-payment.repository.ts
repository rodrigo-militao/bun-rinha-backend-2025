import { RedisClientType } from 'redis';
import Payment from '../../core/domain/entity/payment';
import PaymentRepository from '../../core/domain/repository/paymentRepository';

const PAYMENTS_HASH = 'payments';

export class RedisPaymentRepository implements PaymentRepository {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async purgePayments(): Promise<void> {
    await this.client.flushDb();
  }

  async save(payment: Payment): Promise<void> {
    const paymentJSON = JSON.stringify(payment);
    
    await this.client.hSet(PAYMENTS_HASH, payment.id, paymentJSON);
  }

  async getAllPayments(): Promise<Payment[]> {
    const paymentsData = await this.client.hGetAll(PAYMENTS_HASH);
    
    const paymentJSONs = Object.values(paymentsData);

    const payments = paymentJSONs.map((jsonString): Payment | null => {
      try {
        const parsed = JSON.parse(jsonString);
        parsed.requestedAt = new Date(parsed.requestedAt);
        return parsed as Payment;
      } catch (e) {
        return null;
      }
    }).filter((p): p is Payment => p !== null);

    return payments;
  }
}