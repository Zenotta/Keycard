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
            logger.error(`Redis error: ${error}`);
            reject(error);
        });
        redisClient.connect();
    });
};

const setDb = async (redisClient, address, keypair) => {
    await redisClient.set(
        address,
        JSON.stringify(keypair)
    );

    console.log(logger.success(`Setting to Db: Ok`));
};

const getDb = async (redisClient, address) => {
    const keypair = await redisClient.get(address);

    if (!keypair) { 
        console.log(logger.error('Getting from Db: Error. No entry found')); 
        return null;
    }

    console.log(logger.success(`Getting from Db: Ok`));
    return keypair;
};

module.exports = {
    init,
    setDb,
    getDb,
    redisClient
}