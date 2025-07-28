import { Elysia } from "elysia";
import { createClient, RedisClientType } from "redis";
import RedisPaymentPublisher from "./infrastructure/providers/redisPublisher";
import PublishPaymentUseCase from "./core/application/useCase/publish-payment.use-case";
import GetPaymentSummaryUseCase from "./core/application/useCase/get-payment-summary.use-case";
import { paymentsController } from "./infrastructure/http/controllers/paymentsController";
import PurgePaymentsUseCase from "./core/application/useCase/purge-payments.use-case";
import { adminController } from "./infrastructure/http/controllers/adminController";
import { RedisPaymentRepository } from "./infrastructure/database/redis-payment.repository";

const redis = createClient({ url: 'redis://redis:6379' }) as RedisClientType;

const publisher = new RedisPaymentPublisher(redis);
await publisher.connect();


const paymentRepository = new RedisPaymentRepository(redis);
const publishPaymentUseCase = new PublishPaymentUseCase(publisher);
const getPaymentSummaryUseCase = new GetPaymentSummaryUseCase(paymentRepository);
const purgePaymentsUseCase = new PurgePaymentsUseCase(paymentRepository);

const app = new Elysia()
    .use(adminController(purgePaymentsUseCase))
    .use(paymentsController(publishPaymentUseCase, getPaymentSummaryUseCase))
    .listen(3000);

console.log(
  `🦊 API is running at ${app.server?.hostname}:${app.server?.port}`
);
