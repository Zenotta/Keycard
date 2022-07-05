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

/**
 * Creates a human readable timestamp of the current time
 * @returns 
 */
const getTimestamp = () => {
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

module.exports = {
    constructResponse: constructResponse,
    errorResponse: errorResponse,
    getAllKeypairs: getAllKeypairs,
    getTimestamp: getTimestamp
}