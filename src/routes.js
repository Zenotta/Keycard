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


/* Create Blockchain Item */
router.post('/create_blockchain_item', async (req, res, _next) => {
  const { amount } = req.body;
  const { client } = req.app.locals.blInstance;
  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }
  
  // Keypair for the new item
  const keypair = blockchain.getNewKeypairEncrypted(client);
  if (!keypair) { res.send(utils.errorResponse(500, "Couldn't generate keypair")) }
  
  // Create the item on-chain
  const createReceiptResp = await client.createReceipts(keypair, false, amount);
  const receiptInfo = blockchain.handleCreateReceiptResp(createReceiptResp);
  const balanceCache = req.app.locals.balanceCache;
  
  cache.buildCacheEntryFromCreation(balanceCache, receiptInfo.toAddress, receiptInfo);

  console.log('cache', req.app.locals.balanceCache);

  db.setDb(db.redisClient, receiptInfo.toAddress, keypair);
  res.send(utils.constructResponse(200, 'OK', receiptInfo));
});


/* Send Blockchain Item to Address */
router.post('/send_blockchain_item', async (req, res, _next) => {
  const { address, amount, txHash } = req.body;
  const { client } = req.app.locals.blInstance;
  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }

  // Excess keypair for return
  const excessKeypair = blockchain.getNewKeypairEncrypted(client);
  if (!excessKeypair) { res.send(utils.errorResponse(500, "Couldn't generate excess keypair")) }

  // Send the item on-chain
  const allAddresses = utils.getAllAddresses(req.app.locals.db);
  const sendReceiptResp = await client.makeReceiptPayment(address, amount, txHash, allAddresses, excessKeypair);

  if (sendReceiptResp.status == 'success') {
    db.setDb(db.redisClient, excessKeypair, excessKeypair);
    res.send(utils.constructResponse(200, 'OK', { message: 'Payment sent' }));
    return;
  }

  logger.logHeaderError('Error Sending Blockchain Item', sendReceiptResp);
  res.send(utils.errorResponse(500, "Couldn't send payment"));
});


/* Fetch Blockchain Item Balances */
router.post('/fetch_item_balances', async (req, res, _next) => {
  const refresh = req.body.refresh ? req.body.refresh : false;
  const { client } = req.app.locals.blInstance;
  const balanceCache = req.app.locals.balanceCache;
  const addressList = await utils.getAllAddresses(req.app.locals.db);
  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }

  // If we're just taking from cache
  if (!refresh) {
    const balances = addressList.map(e => balanceCache.get(e));
  
    res.send(utils.constructResponse(200, 'OK', { balances }));
    return;
  }

  // If refresh is forced
  const balanceResp = await client.fetchBalance(addressList);
  if (balanceResp.status == 'success') {
    cache.buildCacheEntriesFromAddressList(balanceCache, balanceResp.content.fetchBalanceResponse.address_list);
    const balances = addressList.map(e => balanceCache.get(e));

    res.send(utils.constructResponse(200, 'OK', { balances }));
    return;
  }

  logger.logHeaderError('Error Fetching Blockchain Item Balances', balanceResp);
  res.send(utils.errorResponse(500, "Couldn't fetch balances"));
});

module.exports = router;
