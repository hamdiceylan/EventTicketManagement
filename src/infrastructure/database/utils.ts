// redisUtils.ts
import { commandClient } from './redisClient';

export const saddAsync = (key: string, member: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        commandClient.sadd(key, member, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

export const sremAsync = (key: string, member: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        commandClient.srem(key, member, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

export const smembersAsync = (key: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        commandClient.smembers(key, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

export const setexAsync = (key: string, seconds: number, value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        commandClient.setex(key, seconds, value, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

export const hsetAsync = (key: string, field: string, value: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        commandClient.hset(key, field, value, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

export const hgetAsync = (key: string, field: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        commandClient.hget(key, field, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

export const watchAsync = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        commandClient.watch(key, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

export const unwatchAsync = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        commandClient.unwatch((err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

export const getAsync = (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        commandClient.get(key, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};
