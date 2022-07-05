const zenotta = require('@zenotta/zenotta-js');


/**
 * Creates an instance of the Zenotta handler for blockchain integration
 * 
 * @param {string} computeHost - Hostname of the mempool node to use.
 * @param {string} intercomHost - Hostname of the intercom node to use.
 * @param {string} passPhrase - Passphrase to use to handle instance encryption
 * @param {string} seedPhrase - Seed phrase to start the instance with. If not provided, a new one will be generated.
 * @returns 
 */
function createZenottaInstance(computeHost, intercomHost, passPhrase, seedPhrase) {
    const seedPhrase = seedPhrase || zenotta.generateSeedPhrase();
    const client = new zenotta.ZenottaInstance();

    const initResult = client.initFromSeed({
        computeHost,
        intercomHost,
        passPhrase,
    },
        seedPhrase
    );

    return {
        client,
        initResult,
        seedPhrase
    }
}

/**
 * Generates a new encrypted keypair from the passed client
 * 
 * @param {*} client 
 * @returns 
 */
function getNewKeypairEncrypted(client) {
    const keypairResp = client.getNewKeypair();

    if (keypairResp && keypairResp.status == 'success') {
        return keypairResp.content.newKeypairResponse;
    }
    
    return null;
}

/**
 * Returns Receipt info from creation call
 * 
 * @param {*} createReceiptResp 
 * @returns 
 */
function handleCreateReceiptResp(createReceiptResp) {
    if (createReceiptResp) {
        return {
            receiptAsset: createReceiptResp.content.asset.asset.Receipt,
            toAddress: createReceiptResp.content.to_address
        }
    }

    return null;
}

module.exports = {
    createZenottaInstance,
    getNewKeypairEncrypted,
    handleCreateReceiptResp
}