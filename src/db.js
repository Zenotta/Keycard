const redis = require('redis');
const logger = require('./logger');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({
    url: REDIS_URL
});

const init = async () => {
    new Promise((resolve, reject) => {
        redisClient.on('connect', () => {
            logger.logHeaderInfo('Redis Connection', 'Connected to Redis successfully');
            resolve(redisClient);
        });

        redisClient.on('error', (error) => {
            logger.logHeaderError('Redis Connection', error);
            reject(error);
            process.exit(1);
        });
        redisClient.connect();
    });
};

const setDb = async (redisClient, key, value) => {
    await redisClient.set(
        key,
        JSON.stringify(value)
    ).catch(error => {
        console.log(logger.error('Setting to Db: Error.', error));
    });

    console.log(logger.success(`Setting to Db: Ok`));
};

const getDb = async (redisClient, key) => {
    const value = await redisClient.get(key);

    if (!value) { 
        console.log(logger.error('Getting from Db: Error. No entry found')); 
        return null;
    }

    console.log(logger.success(`Getting from Db: Ok`));
    return value;
};

const getAll = async (redisClient, keys) => {
    let values = [];

    for (let key of keys) {
        values.push(JSON.parse(await getDb(redisClient, key)));
    }

    return values;
}

module.exports = {
    init,
    setDb,
    getDb,
    getAll,
    redisClient,
}