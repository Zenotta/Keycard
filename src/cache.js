const utils = require('./utils');
const logger = require('./logger');

class Node {
    constructor(value) {
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class NetworkCache {
    constructor(capacity) {
        this.head = null;
        this.tail = null;
        this.lookup = {};

        this.capacity = capacity;
    }

    /**
     * Adds a new entry to the cache
     * 
     * @param {string} id 
     * @param {any} value 
     */
    add(id, value) {
        let entry = new Node(value);

        if (this.reachedCapacity()) {
            this.ejectLRU();
        }

        if (this.tail) {
            this.tail.next = entry;
            entry.prev = this.tail;
            this.tail = entry;
        } else {
            this.head = entry;
            this.tail = entry;
        }

        this.lookup[id] = entry;
    }

    /**
     * Gets an entry by id
     * 
     * @param {string} id 
     */
    get(id) {
        if (this.lookup.hasOwnProperty(id)) {
            let entry = this.lookup[id];

            this.makeMostRecent(entry);
            this.removeFromPosition(entry);

            return entry.value;
        }
        
        return null;
    }

    /** Removes the least recently used entry from the cache */
    ejectLRU() {
        this.head = this.head.next;
        this.head.prev = null;
    }

    /**
     * Makes the passed entry the most recently tagged in the cache
     * 
     * @param {Node} entry
     */
    makeMostRecent(entry) {
        let newEntry = new Node(entry.value);

        // Create new tail
        newEntry.next = null;
        newEntry.prev = this.tail;
        this.tail.next = newEntry;
        this.tail = newEntry;
    }

    /**
     * Removes the entry from its current position in the cache
     * 
     * @param {Node} entry 
     */
    removeFromPosition(entry) {
        // If we're dealing with the head
        if (!entry.prev) {
            this.head = entry.next;
            this.head.prev = null;

        } else if (entry.next) {
            entry.prev.next = entry.next;
            entry.next.prev = entry.prev;
        }
    }

    /**
     * Predicate for checking whether cache has reached capacity
     */
    reachedCapacity() {
        return Object.keys(this.lookup).length >= this.capacity;
    }
}


///
///
/// ------------------ UTILITY FUNCTIONS ------------------ ///
///
///

/**
 * Initialises the cache for the address balances on this instance
 * 
 * @param {*} redisClient 
 * @param {*} blClient
 * @param {number} cacheCapacity
 */
 async function initBalanceCache(redisClient, blClient, cacheCapacity) {
    const balanceCache = new NetworkCache(cacheCapacity);
    const addressList = await utils.getAllAddresses(redisClient);
    const balanceResp = await blClient.fetchBalance(addressList);

    if (balanceResp.status != 'success') {
        logger.logHeaderError('Initialising Balance Cache', balanceResp.message);
        process.exit(1);
    }

    const addrResp = balanceResp.content.fetchBalanceResponse.address_list;
    buildCacheEntriesFromAddressList(balanceCache, addrResp);

    return balanceCache;
}

/**
 * Util function to build the cache entries from a list of addresses
 * 
 * @param {*} cache 
 * @param {string[]} addressList 
 */
function buildCacheEntriesFromAddressList(cache, addressList) {
    for (let address in addressList) {
        const vals = addressList[address];
        let cacheEntry = {};

        for (const tx of vals) {
            const receipt = tx.value.Receipt;

            if (receipt) {
                cacheEntry[receipt.drs_tx_hash] = receipt.amount;
            }
        }

        cache.add(address, cacheEntry);
    }
}

/**
 * Builds a cache entry from a receipt creation event
 * 
 * @param {*} cache 
 * @param {string} address 
 * @param {*} receiptResp 
 */
function buildCacheEntryFromCreation(cache, address, receiptResp) {
    let cacheEntry = {};
    cacheEntry[receiptResp.receiptAsset.drs_tx_hash] = receiptResp.receiptAsset.amount;
    cache.add(address, cacheEntry);
}

module.exports = {
    Node,
    NetworkCache,
    initBalanceCache,
    buildCacheEntryFromCreation,
    buildCacheEntriesFromAddressList
};
