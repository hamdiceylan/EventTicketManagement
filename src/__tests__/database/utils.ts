import { commandClient } from '../../infrastructure/database/redisClient';
import {
    saddAsync,
    sremAsync,
    smembersAsync,
    setexAsync,
    hsetAsync,
    hgetAsync,
    watchAsync,
    unwatchAsync,
    getAsync,
} from '../../infrastructure/database/utils';

jest.mock('../../infrastructure/database/redisClient', () => ({
    commandClient: {
        sadd: jest.fn(),
        srem: jest.fn(),
        smembers: jest.fn(),
        setex: jest.fn(),
        hset: jest.fn(),
        hget: jest.fn(),
        watch: jest.fn(),
        unwatch: jest.fn(),
        get: jest.fn(),
    }
}));

describe('Redis Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saddAsync should resolve with result', async () => {
        (commandClient.sadd as jest.Mock).mockImplementation((key, member, callback) => {
            callback(null, 1);
        });
        const result = await saddAsync('key', 'member');
        expect(result).toBe(1);
        expect(commandClient.sadd).toHaveBeenCalledWith('key', 'member', expect.any(Function));
    });

    it('saddAsync should reject with error', async () => {
        (commandClient.sadd as jest.Mock).mockImplementation((key, member, callback) => {
            callback(new Error('error'), null);
        });
        await expect(saddAsync('key', 'member')).rejects.toThrow('error');
        expect(commandClient.sadd).toHaveBeenCalledWith('key', 'member', expect.any(Function));
    });

    it('sremAsync should resolve with result', async () => {
        (commandClient.srem as jest.Mock).mockImplementation((key, member, callback) => {
            callback(null, 1);
        });
        const result = await sremAsync('key', 'member');
        expect(result).toBe(1);
        expect(commandClient.srem).toHaveBeenCalledWith('key', 'member', expect.any(Function));
    });

    it('sremAsync should reject with error', async () => {
        (commandClient.srem as jest.Mock).mockImplementation((key, member, callback) => {
            callback(new Error('error'), null);
        });
        await expect(sremAsync('key', 'member')).rejects.toThrow('error');
        expect(commandClient.srem).toHaveBeenCalledWith('key', 'member', expect.any(Function));
    });

    it('smembersAsync should resolve with result', async () => {
        (commandClient.smembers as jest.Mock).mockImplementation((key, callback) => {
            callback(null, ['member1', 'member2']);
        });
        const result = await smembersAsync('key');
        expect(result).toEqual(['member1', 'member2']);
        expect(commandClient.smembers).toHaveBeenCalledWith('key', expect.any(Function));
    });

    it('smembersAsync should reject with error', async () => {
        (commandClient.smembers as jest.Mock).mockImplementation((key, callback) => {
            callback(new Error('error'), null);
        });
        await expect(smembersAsync('key')).rejects.toThrow('error');
        expect(commandClient.smembers).toHaveBeenCalledWith('key', expect.any(Function));
    });

    it('setexAsync should resolve with result', async () => {
        (commandClient.setex as jest.Mock).mockImplementation((key, seconds, value, callback) => {
            callback(null, 'OK');
        });
        const result = await setexAsync('key', 60, 'value');
        expect(result).toBe('OK');
        expect(commandClient.setex).toHaveBeenCalledWith('key', 60, 'value', expect.any(Function));
    });

    it('setexAsync should reject with error', async () => {
        (commandClient.setex as jest.Mock).mockImplementation((key, seconds, value, callback) => {
            callback(new Error('error'), null);
        });
        await expect(setexAsync('key', 60, 'value')).rejects.toThrow('error');
        expect(commandClient.setex).toHaveBeenCalledWith('key', 60, 'value', expect.any(Function));
    });

    it('hsetAsync should resolve with result', async () => {
        (commandClient.hset as jest.Mock).mockImplementation((key, field, value, callback) => {
            callback(null, 1);
        });
        const result = await hsetAsync('key', 'field', 'value');
        expect(result).toBe(1);
        expect(commandClient.hset).toHaveBeenCalledWith('key', 'field', 'value', expect.any(Function));
    });

    it('hsetAsync should reject with error', async () => {
        (commandClient.hset as jest.Mock).mockImplementation((key, field, value, callback) => {
            callback(new Error('error'), null);
        });
        await expect(hsetAsync('key', 'field', 'value')).rejects.toThrow('error');
        expect(commandClient.hset).toHaveBeenCalledWith('key', 'field', 'value', expect.any(Function));
    });

    it('hgetAsync should resolve with result', async () => {
        (commandClient.hget as jest.Mock).mockImplementation((key, field, callback) => {
            callback(null, 'value');
        });
        const result = await hgetAsync('key', 'field');
        expect(result).toBe('value');
        expect(commandClient.hget).toHaveBeenCalledWith('key', 'field', expect.any(Function));
    });

    it('hgetAsync should reject with error', async () => {
        (commandClient.hget as jest.Mock).mockImplementation((key, field, callback) => {
            callback(new Error('error'), null);
        });
        await expect(hgetAsync('key', 'field')).rejects.toThrow('error');
        expect(commandClient.hget).toHaveBeenCalledWith('key', 'field', expect.any(Function));
    });

    it('watchAsync should resolve', async () => {
        (commandClient.watch as jest.Mock).mockImplementation((key, callback) => {
            callback(null);
        });
        await expect(watchAsync('key')).resolves.toBeUndefined();
        expect(commandClient.watch).toHaveBeenCalledWith('key', expect.any(Function));
    });

    it('watchAsync should reject with error', async () => {
        (commandClient.watch as jest.Mock).mockImplementation((key, callback) => {
            callback(new Error('error'));
        });
        await expect(watchAsync('key')).rejects.toThrow('error');
        expect(commandClient.watch).toHaveBeenCalledWith('key', expect.any(Function));
    });

    it('unwatchAsync should resolve', async () => {
        (commandClient.unwatch as jest.Mock).mockImplementation((callback) => {
            callback(null);
        });
        await expect(unwatchAsync()).resolves.toBeUndefined();
        expect(commandClient.unwatch).toHaveBeenCalledWith(expect.any(Function));
    });

    it('unwatchAsync should reject with error', async () => {
        (commandClient.unwatch as jest.Mock).mockImplementation((callback) => {
            callback(new Error('error'));
        });
        await expect(unwatchAsync()).rejects.toThrow('error');
        expect(commandClient.unwatch).toHaveBeenCalledWith(expect.any(Function));
    });

    it('getAsync should resolve with result', async () => {
        (commandClient.get as jest.Mock).mockImplementation((key, callback) => {
            callback(null, 'value');
        });
        const result = await getAsync('key');
        expect(result).toBe('value');
        expect(commandClient.get).toHaveBeenCalledWith('key', expect.any(Function));
    });

    it('getAsync should reject with error', async () => {
        (commandClient.get as jest.Mock).mockImplementation((key, callback) => {
            callback(new Error('error'), null);
        });
        await expect(getAsync('key')).rejects.toThrow('error');
        expect(commandClient.get).toHaveBeenCalledWith('key', expect.any(Function));
    });
});
