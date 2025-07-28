import { RedisClientType } from 'redis';

export default class RedisSubscriber {
  private client: RedisClientType;
  private subscriber: RedisClientType;

  constructor(client: RedisClientType) {
    console.log('Initializing Redis Subscriber...');
    this.client = client;
    this.subscriber = this.client.duplicate();

    this.client.on('error', err => console.error('Redis Client (main) Error:', err));
    this.subscriber.on('error', err => console.error('Redis Client (subscriber) Error:', err));
  }


   async connect(): Promise<void> {
    if (!this.client.isReady) {
      console.log('Connecting main Redis client...');
      await this.client.connect();
      console.log('Main Redis client connected.');
    }
    if (!this.subscriber.isReady) {
      console.log('Connecting Redis subscriber...');
      await this.subscriber.connect();
      console.log('Redis subscriber connected.');
    }
  }

  async subscribe(queueName: string, handler: (message: string) => Promise<void>) {
    console.log(`Worker listening on queue "${queueName}"...`);
    while (true) {
      try {
        const result = await this.client.blPop(queueName, 0);

        if (result) {
          await handler(result.element);
        }
      } catch (error) {
        console.error('Worker loop error, restarting in 5 seconds:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}