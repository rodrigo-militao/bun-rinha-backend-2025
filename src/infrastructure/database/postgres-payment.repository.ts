import postgres from "postgres";
import PaymentRepository from "../../core/domain/repository/paymentRepository";
import Payment from "../../core/domain/entity/payment";

export default class PostgresPaymentRepository implements PaymentRepository {
  constructor(private sql: postgres.Sql) {}

  async getSummary(from: Date, to: Date): Promise<{ processor: number, total_requests: number, total_amount: number }[]> {
    return await this.sql`
      SELECT * FROM payment_summaries WHERE summary_date BETWEEN ${from} AND ${to};
    `;
  }

  async save(payment: Payment): Promise<void> {
      await this.sql.begin(async (tx) => {
        await tx`INSERT INTO payments (id, amount, processor) 
        VALUES (${payment.id}, ${payment.amount}, ${payment.processor})`;
  
        await tx`INSERT INTO payment_summaries (processor, summary_date, total_requests, total_amount)
                  VALUES (${payment.processor}, date_trunc('hour', now()), 1, ${payment.amount})
                  ON CONFLICT (processor, summary_date)
                  DO UPDATE SET
                    total_requests = payment_summaries.total_requests + 1,
                    total_amount = payment_summaries.total_amount + EXCLUDED.total_amount;`;
      });
    }

  async purgePayments(): Promise<void> {
    await this.sql.begin(async (tx) => {
      await tx`TRUNCATE TABLE payment_summaries;`

      await tx`TRUNCATE TABLE payments;`
    })
  }
}