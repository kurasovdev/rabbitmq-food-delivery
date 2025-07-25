# 🍔 RabbitMQ Microservices Demo — Food Delivery Platform

This is a demo project that showcases a microservice-based architecture for an online food delivery platform, using **Node.js**, **Docker**, and **RabbitMQ** as the message broker.

Each microservice performs a single responsibility and communicates asynchronously via message queues and topic/fanout exchanges.

---

## 📦 Services Overview

| Service               | Description                                                                   |
|-----------------------|-------------------------------------------------------------------------------|
| `order-service`       | Accepts and publishes new customer orders.                                    |
| `restaurant-service`  | Receives new orders and simulates preparation.                                |
| `courier-service`     | Listens for ready orders, assigns couriers, and emits courier assignment events. |
| `notification-service`| Receives all events and prints notifications.                                 |
| `billing-service`     | Handles payments (listens for `order.paid` events).                           |
| `tracking-service`    | Simulates periodic courier geolocation updates.                               |
| `rabbitmq`            | Message broker for async communication (management UI on port `15672`).       |

---

## 🧱 Architecture

### 📡 Message Exchanges and Routing

- **`order.exchange`** (type: `topic`):
  - Used for events such as:
    - `order.created`
    - `order.ready`
    - `order.paid`
    - `courier.assigned`
  - Bound queues:
    - `restaurant.queue` — listens to `order.created`
    - `courier.queue` — listens to `order.ready`
    - `billing.queue` — listens to `order.paid`
    - `notification.queue` — listens to all topics via `#`

- **`courier.exchange`** (type: `fanout`):
  - Used for real-time courier geolocation updates.
  - Subscribers can include:
    - `tracking-service`
    - map services
    - user dashboards

### 🔁 Communication Flow

```text
1. User places an order
   → order-service publishes 'order.created'

2. restaurant-service receives 'order.created'
   → simulates food prep
   → publishes 'order.ready'

3. courier-service receives 'order.ready'
   → assigns a courier
   → publishes 'courier.assigned'

4. billing-service processes 'order.paid'

5. notification-service listens to all events via '#'

6. tracking-service publishes position updates to 'courier.exchange'
```

---

## ▶️ How to Run

### 1. Clone the repo

```bash
git clone https://github.com/kurasovdev/rabbitmq-food-delivery.git
cd rabbitmq-food-delivery
```

### 2. Start the stack

```bash
docker-compose up --build
```

### 3. Access RabbitMQ UI

- URL: [http://localhost:15672](http://localhost:15672)  
- Username: `guest`  
- Password: `guest`

---

## 🛠 Built With

- **Node.js** (ESM)
- **amqplib** (AMQP client)
- **RabbitMQ** (message broker)
- **Docker & Docker Compose**

---

## 📌 Notes

- This is a simulation project for learning purposes.
- All services run once and exit (or stay listening), depending on their role.
- No persistent DB or external API integrations (can be added easily).

---

## 📬 License

MIT — use it freely for learning or prototyping.
