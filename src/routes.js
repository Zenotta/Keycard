const express = require('express');
const router = express.Router();
const utils = require('./utils');
const blockchain = require('./blockchain');
const db = require('./db');
const cache = require('./cache');
const logger = require('./logger');

/* GET home page. */
router.get('/', (_req, res, _next) => {
  res.send(utils.constructResponse(200, 'OK', { message: 'Hello World!' }));
});


// ======= CREATE BLOCKCHAIN ITEM ======= //
router.post('/create_blockchain_item', async (req, res, _next) => {
  const { amount } = req.body;
  const { client } = req.app.locals.blInstance;
  const { verbose } = req.app.locals;
  const verboseContext = '/create_blockchain_item';
  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }
  
  // Keypair for the new item
  const keypair = blockchain.getNewKeypairEncrypted(client);
  verbose.log(verboseContext, 'Generated new keypair', keypair);
  if (!keypair) { res.send(utils.errorResponse(500, "Couldn't generate keypair")) }
  
  // Create the item on-chain
  const createReceiptResp = await client.createReceipts(keypair, false, amount);
  verbose.log(verboseContext, 'Created new item', createReceiptResp);

  const receiptInfo = blockchain.handleCreateReceiptResp(createReceiptResp);
  verbose.log(verboseContext, 'Handled create receipt response', receiptInfo);

  const balanceCache = req.app.locals.balanceCache;
  cache.buildCacheEntryFromCreation(balanceCache, receiptInfo.toAddress, receiptInfo);
  verbose.log(verboseContext, 'Built cache entry', JSON.parse(balanceCache));

  db.setDb(db.redisClient, receiptInfo.toAddress, keypair);
  verbose.log(verboseContext, 'Stored keypair in db', JSON.parse(await db.getDb(db.redisClient, receiptInfo.toAddress)));

  res.send(utils.constructResponse(200, 'OK', receiptInfo));
});


// ======= SEND BLOCKCHAIN ITEM ======= //
router.post('/send_blockchain_item', async (req, res, _next) => {
  const { address, amount, txHash } = req.body;
  const { client } = req.app.locals.blInstance;
  const redisClient = req.app.locals.db;
  const { verbose } = req.app.locals;
  const verboseContext = '/send_blockchain_item';
  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }

  // Excess keypair for return
  const excessKeypair = blockchain.getNewKeypairEncrypted(client);
  if (!excessKeypair) { res.send(utils.errorResponse(500, "Couldn't generate excess keypair")) }

  const allAddresses = await utils.getAllAddresses(redisClient);
  verbose.log(verboseContext, 'allAddresses', allAddresses);

  const allKeypairs = await db.getAll(redisClient, allAddresses);
  verbose.log(verboseContext, 'allKeypairs', allKeypairs);

  // Send the item on-chain
  const sendReceiptResp = await client.makeReceiptPayment(address, amount, txHash, allKeypairs, excessKeypair);
  verbose.log(verboseContext, 'sendReceiptResp', sendReceiptResp);

  if (sendReceiptResp.status == 'success') {
    db.setDb(redisClient, excessKeypair.address, excessKeypair);
    verbose.log(verboseContext, 'Db excess keypair entry', await db.getDb(redisClient, excessKeypair.address));

    res.send(utils.constructResponse(200, 'OK', { message: 'Payment sent' }));
    return;
  }

  logger.logHeaderError('Error Sending Blockchain Item', sendReceiptResp);
  res.send(utils.errorResponse(500, "Couldn't send payment"));
});


// ======= FETCH BLOCKCHAIN ITEM BALANCES ======= //
router.post('/fetch_item_balances', async (req, res, _next) => {
  const refresh = req.body.refresh ? req.body.refresh : false;
  const { client } = req.app.locals.blInstance;
  const { verbose } = req.app.locals;
  const verboseContext = '/fetch_item_balances';
  const balanceCache = req.app.locals.balanceCache;
  const addressList = await utils.getAllAddresses(req.app.locals.db);

  verbose.log(verboseContext, 'Address List', addressList);

  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }

  // If we're just taking from cache
  if (!refresh) {
    verbose.log(verboseContext, 'Fetching From Cache', '...');
    const balances = addressList.map(e => balanceCache.get(e));

    verbose.log(verboseContext, 'Balances', balances);
  
    res.send(utils.constructResponse(200, 'OK', { balances }));
    return;
  }

  // If refresh is forced
  verbose.log(verboseContext, 'Fetching From Blockchain', '...');
  const balanceResp = await client.fetchBalance(addressList);

  verbose.log(verboseContext, 'Fetch Balance Response', JSON.stringify(balanceResp));
  if (balanceResp.status == 'success') {
    cache.buildCacheEntriesFromAddressList(balanceCache, balanceResp.content.fetchBalanceResponse.address_list);
    verbose.log(verboseContext, 'Cache Build', balanceCache);

    const balances = addressList.map(e => balanceCache.get(e));
    verbose.log(verboseContext, 'Balances in Cache', balances);

    res.send(utils.constructResponse(200, 'OK', { balances }));
    return;
  }

  logger.logHeaderError('Error Fetching Blockchain Item Balances', balanceResp);
  res.send(utils.errorResponse(500, "Couldn't fetch balances"));
});


// ======= EXPORT SEED PHRASE ======= //

router.get('/seed_phrase', async (req, res, _next) => {
  const { client } = req.app.locals.blInstance;
  const { verbose } = req.app.locals;
  const verboseContext = '/seed_phrase';

  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }

  const seedPhraseResp = client.getSeedPhrase();
  verbose.log(verboseContext, 'Seed Phrase Response', seedPhraseResp);

  if (seedPhraseResp.status != 'success') { 
    const dbRes = await db.getDb(req.app.locals.db, 'sp');
    verbose.log(verboseContext, 'Seed Phrase Retrieval from Redis Db', dbRes);

    if (!dbRes) {
      res.send(utils.errorResponse(405, "Seed Phrase not found in cache or client"));
    }

    let seedPhrase = utils.formatSeedPhrase(dbRes);
    verbose.log(verboseContext, 'Seed Phrase in Final Response', seedPhrase);
    res.send(utils.constructResponse(200, 'OK', { seedPhrase }));
    return;
  }

  res.send(utils.constructResponse(200, 'OK', seedPhraseResp));
}); 

module.exports = router;
