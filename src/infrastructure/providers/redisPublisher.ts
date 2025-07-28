import { RedisClientType } from 'redis';
import PaymentPublisher from '../../core/application/interfaces/paymentPublisher';

export default class RedisPaymentPublisher implements PaymentPublisher {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    console.log('Initializing Redis Publisher...');
    this.client = client;

    this.client.on('error', err => console.error('Redis Client Error:', err));
  }

  async connect() {
    if (!this.client.isReady) {
      console.log('Connecting to Redis...');
      await this.client.connect();
      console.log('Connected to Redis!');
    }
  }

  async publish(payload: { amount: number; correlationId: string }) {
    await this.client.lPush('pagamentos', JSON.stringify(payload))
    // await this.client.publish('pagamentos', JSON.stringify(payload));
  }
}
