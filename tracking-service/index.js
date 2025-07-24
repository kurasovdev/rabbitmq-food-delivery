import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE = 'courier.exchange';

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
  await ch.assertExchange(EXCHANGE, 'fanout', { durable: false });

  const position = {
    courierId: 'c123',
    lat: 50.45,
    lon: 30.52,
    time: new Date().toISOString(),
  };

  ch.publish(EXCHANGE, '', Buffer.from(JSON.stringify(position)));
  console.log('📍 Courier position sent:', position);

  setTimeout(() => conn.close(), 500);
};

run().catch(console.error);
