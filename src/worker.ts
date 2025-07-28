import { createClient, RedisClientType } from 'redis';
import ProcessPaymentUseCase from './core/application/useCase/process-payment.use-case';
import RedisSubscriber from './infrastructure/providers/redisSubscriber';
import { RedisPaymentRepository } from './infrastructure/database/redis-payment.repository';

const URL_DEFAULT = Bun.env.PAYMENT_PROCESSOR_URL_DEFAULT ?? 'http://payment-processor-default:8080';
const URL_FALLBACK = Bun.env.PAYMENT_PROCESSOR_URL_FALLBACK ?? 'http://payment-processor-fallback:8080';

const redis = createClient({ url: Bun.env.REDIS_URL ?? 'redis://redis:6379' }) as RedisClientType;

const paymentRepository = new RedisPaymentRepository(redis);
const processPaymentUseCase = new ProcessPaymentUseCase(paymentRepository, URL_DEFAULT, URL_FALLBACK);

const subscriber = new RedisSubscriber(redis);

await subscriber.connect();

await subscriber.subscribe('pagamentos', async (message) => {
  await processPaymentUseCase.execute(message);
});

console.log('⚙️ Worker running and listening for payment messages...');
