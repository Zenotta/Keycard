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
async function getAllKeypairs(redisClient) {
    let keypairs = await redisClient.keys("*");
    return keypairs.filter(e => e != 'mkey');
}

module.exports = {
    constructResponse: constructResponse,
    errorResponse: errorResponse,
    getAllKeypairs: getAllKeypairs
}