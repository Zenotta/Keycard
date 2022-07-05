function constructResponse(status, message, data) {
    return {
        status: status,
        reason: message,
        content: data
    };
}

function errorResponse(status, message) {
    return constructResponse(status, message, null);
}

function getAllKeypairs() {
    return [];
}

module.exports = {
    constructResponse: constructResponse,
    errorResponse: errorResponse,
    getAllKeypairs: getAllKeypairs
}