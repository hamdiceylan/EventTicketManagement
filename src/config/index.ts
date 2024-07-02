import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  redis: {
    host: string;
    port: number;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
};

export default config;
