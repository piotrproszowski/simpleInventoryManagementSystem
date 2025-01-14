interface MongoConfig {
  writeUri: string;
  readUri: string;
}

interface RabbitMQConfig {
  url: string;
  exchangeName: string;
}

export interface Config {
  mongodb: MongoConfig;
  rabbitmq: RabbitMQConfig;
}
