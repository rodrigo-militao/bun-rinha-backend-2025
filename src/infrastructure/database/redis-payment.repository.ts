import { RedisClientType } from 'redis';
import PaymentRepository from '../../core/domain/repository/paymentRepository';
import Payment from '../../core/domain/entity/payment';

export default class RedisPaymentRepository implements PaymentRepository {
  constructor(private redis: RedisClientType) {}

  async save(payment: Payment): Promise<void> {
    const timestamp = new Date();
    const summaryKey = this._getSummaryKey(payment.processor ?? 0, timestamp);

    // Salvar detalhes do pagamento (opcional)
    await this.redis.hSet(`payment:${payment.id}`, {
      id: payment.id,
      amount: payment.amount.toString(),
      processor: (payment.processor?? 0).toString(),
      timestamp: timestamp.toISOString(),
    });

    // Atualizar resumo (usando HINCRBY e HINCRBYFLOAT)
    await this.redis.hIncrBy(summaryKey, 'total_requests', 1);
    await this.redis.hIncrByFloat(summaryKey, 'total_amount', payment.amount);

    // Expirar após 24h (TTL opcional)
    await this.redis.expire(summaryKey, 60 * 60 * 24);
  }

  async getSummary(from: Date, to: Date): Promise<{ processor: number, total_requests: number, total_amount: number }[]> {
    const results: { [key: number]: { total_requests: number, total_amount: number } } = {};
    const hours = this._generateHourBuckets(from, to);

    for (const hour of hours) {
      for (const processor of [0, 1]) {
        const key = this._getSummaryKey(processor, hour);
        const data = await this.redis.hGetAll(key);

        if (data && data.total_requests && data.total_amount) {
          const p = processor;
          const total_requests = parseInt(data.total_requests);
          const total_amount = parseFloat(data.total_amount);

          if (!results[p]) {
            results[p] = { total_requests, total_amount };
          } else {
            results[p].total_requests += total_requests;
            results[p].total_amount += total_amount;
          }
        }
      }
    }

    return Object.entries(results).map(([processor, summary]) => ({
      processor: Number(processor),
      total_requests: summary.total_requests,
      total_amount: summary.total_amount,
    }));
  }

  private _getSummaryKey(processor: number, date: Date): string {
    const hourKey = date.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
    return `summary:${processor}:${hourKey}`;
  }

  private _generateHourBuckets(from: Date, to: Date): Date[] {
    const buckets: Date[] = [];
    const current = new Date(from);
    current.setMinutes(0, 0, 0);

    while (current <= to) {
      buckets.push(new Date(current));
      current.setHours(current.getHours() + 1);
    }

    return buckets;
  }
}
