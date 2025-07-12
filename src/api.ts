import { Elysia } from "elysia";
import postgres from "postgres";
import RedisPaymentPublisher from "./infrastructure/providers/redisPublisher";
import PublishPaymentUseCase from "./core/application/useCase/publish-payment.use-case";
import GetPaymentSummaryUseCase from "./core/application/useCase/get-payment-summary.use-case";
import PostgresPaymentRepository from "./infrastructure/database/postgres-payment.repository";
import { paymentsController } from "./infrastructure/http/controllers/paymentsController";
import { createClient, RedisClientType } from "redis";

const redis = createClient({ url: 'redis://redis:6379' }) as RedisClientType;

const publisher = new RedisPaymentPublisher(redis);
await publisher.connect();


const sql = postgres({
  host: Bun.env.DB_HOST,
  user: Bun.env.DB_USER,
  password: Bun.env.DB_PASS,
  database: Bun.env.DB_NAME,
});


const paymentRepository = new PostgresPaymentRepository(sql);
const publishPaymentUseCase = new PublishPaymentUseCase(publisher);
const getPaymentSummaryUseCase = new GetPaymentSummaryUseCase(paymentRepository);

const app = new Elysia()
    .use(paymentsController(publishPaymentUseCase, getPaymentSummaryUseCase))
    .listen(3000);

console.log(
  `🦊 API is running at ${app.server?.hostname}:${app.server?.port}`
);
