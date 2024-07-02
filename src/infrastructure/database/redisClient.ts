import { createClient, RedisClient } from 'redis';
import config from '../../config';
import { handleKeyExpiration } from './handleKeyExpiration';

const commandClient: RedisClient = createClient({ host: config.redis.host, port: config.redis.port });
const subscriptionClient: RedisClient = createClient({ host: config.redis.host, port: config.redis.port });

commandClient.on('error', (err) => {
    console.error('Redis command client error:', err);
});

commandClient.on('connect', () => {
    console.log('Redis command client connected');
});

subscriptionClient.on('error', (err) => {
    console.error('Redis subscription client error:', err);
});

subscriptionClient.on('connect', () => {
    console.log('Redis subscription client connected');
    subscriptionClient.psubscribe('__keyevent@0__:expired');
});

subscriptionClient.on('pmessage', (pattern, channel, message) => {
    handleKeyExpiration(channel, message);
});

export { commandClient, subscriptionClient };