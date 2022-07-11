const config = require('../config.json');

/**
 * Generic constructor for consistent response handling
 * 
 * @param {number} status - HTTP status code
 * @param {string} message - Message about status
 * @param {Object} data - Data to be returned
 * @returns 
 */
function constructResponse(status, message, data) {
    return {
        status: status,
        reason: message,
        content: data
    };
}

/**
 * Constructs an error-specific response
 * 
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns 
 */
function errorResponse(status, message) {
    return constructResponse(status, message, null);
}

/**
 * Gets all keypairs stored on disk
 * 
 * @returns 
 */
async function getAllAddresses(redisClient) {
    let keypairs = await redisClient.keys("*");
    return keypairs.filter(e => isValidPaymentAddress(e));
}

/**
 * Predicate to check whether payment address is valid
 * 
 * @param {string} address 
 * @returns 
 */
function isValidPaymentAddress(address) {
    const re = /^[0-9A-Fa-fx]{64}$/;
    return address.match(re);
}

/**
 * Creates a human readable timestamp of the current time
 * @returns 
 */
function getTimestamp() {
    const a = new Date();
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate() < 10 ? `0${a.getDate()}` : a.getDate();
    const hour = a.getHours() < 10 ? `0${a.getHours()}` : a.getHours();
    const min = a.getMinutes() < 10 ? `0${a.getMinutes()}` : a.getMinutes();
    const sec = a.getSeconds() < 10 ? `0${a.getSeconds()}` : a.getSeconds();
    const time = `${date} ${month} ${year} - ${hour}:${min}:${sec}`;
    return time;
};

function getConfigArgs() {
    if (process.env.NODE_ENV === 'production') {
        return {
            passPhrase: process.env.PASSPHRASE || config.passPhrase,
            intercomHost: process.env.INTERCOM_HOST || config.intercomHost,
            computeHost: process.env.COMPUTE_HOST || config.computeHost,
            cacheCapacity: process.env.CACHE_CAPACITY || config.cacheCapacity
        };
    }

    return {
        passPhrase: process.argv[2] || config.passPhrase,
        intercomHost: process.argv[3] || config.intercomHost,
        computeHost: process.argv[4] || config.computeHost,
        cacheCapacity: process.argv[5] || config.cacheCapacity
    }
}

module.exports = {
    constructResponse: constructResponse,
    errorResponse: errorResponse,
    getAllAddresses: getAllAddresses,
    getTimestamp: getTimestamp,
    getConfigArgs: getConfigArgs,
    isValidPaymentAddress: isValidPaymentAddress
}