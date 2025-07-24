import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE = 'order.exchange';

const connectWithRetry = async () => {
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      console.log('✅ Connected to RabbitMQ');
      return conn;
    } catch (err) {
      console.log(`⏳ Retry ${i + 1}/${maxRetries}: RabbitMQ not ready, waiting...`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  throw new Error('❌ Failed to connect to RabbitMQ after retries');
};

const run = async () => {
  const conn = await connectWithRetry();
  const ch = await conn.createChannel();

  await ch.assertExchange(EXCHANGE, 'topic', { durable: true });
  const q = await ch.assertQueue('notification.queue', { durable: true });

  await ch.bindQueue(q.queue, EXCHANGE, '#');

  ch.consume(q.queue, (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log('📢 Notification:', data);
    ch.ack(msg);
  });

  console.log('Notification service is running...');
};

run().catch(console.error);
