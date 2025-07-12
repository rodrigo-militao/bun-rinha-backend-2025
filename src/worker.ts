import postgres from 'postgres';
import { createClient, RedisClientType } from 'redis';
import ProcessPaymentUseCase from './core/application/useCase/process-payment.use-case';
import PostgresPaymentRepository from './infrastructure/database/postgres-payment.repository';
import RedisSubscriber from './infrastructure/providers/redisSubscriber';

const URL_DEFAULT = Bun.env.PAYMENT_PROCESSOR_URL_DEFAULT ?? 'http://payment-processor-default:8080';
const URL_FALLBACK = Bun.env.PAYMENT_PROCESSOR_URL_FALLBACK ?? 'http://payment-processor-fallback:8080';

const redis = createClient({ url: 'redis://redis:6379' }) as RedisClientType;

const sql = postgres({
  host: Bun.env.DB_HOST,
  user: Bun.env.DB_USER,
  password: Bun.env.DB_PASS,
  database: Bun.env.DB_NAME,
});

const paymentRepository = new PostgresPaymentRepository(sql);
const processPaymentUseCase = new ProcessPaymentUseCase(paymentRepository, URL_DEFAULT, URL_FALLBACK);

const subscriber = new RedisSubscriber(redis);

await subscriber.connect();

await subscriber.subscribe('pagamentos', async (message) => {
  await processPaymentUseCase.execute(message);
});

console.log('⚙️ Worker running and listening for payment messages...');
