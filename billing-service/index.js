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

  // Assert the exchange and queue for billing
  await ch.assertExchange(EXCHANGE, 'topic', { durable: true });
  const q = await ch.assertQueue('billing.queue', { durable: true });

  // Bind to the specific routing key for billing
  await ch.bindQueue(q.queue, EXCHANGE, 'order.paid');

  ch.consume(q.queue, (msg) => {
    const order = JSON.parse(msg.content.toString());
    console.log('Billing processing:', order);
    ch.ack(msg);
  });

  console.log('Billing service is running...');
};

run().catch(console.error);
