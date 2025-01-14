interface MongoConfig {
  writeUri: string;
  readUri: string;
}

export interface Config {
  mongodb: MongoConfig;
}
