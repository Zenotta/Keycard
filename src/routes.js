const express = require('express');
const router = express.Router();
const utils = require('./utils');
const blockchain = require('./blockchain');
const db = require('./db');
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
  
  const keypair = blockchain.getNewKeypairEncrypted(client);
  if (!keypair) { res.send(utils.errorResponse(500, "Couldn't generate keypair")) }
  
  const createReceiptResp = await client.createReceipts(keypair, true, amount);
  const receiptInfo = blockchain.handleCreateReceiptResp(createReceiptResp);
  
  db.setDb(db.redisClient, receiptInfo.toAddress, keypair);
  res.send(utils.constructResponse(200, 'OK', receiptInfo));
});

/* Send Blockchain Item to Address */
router.post('/send_blockchain_item', async (req, res, _next) => {
  const { address, amount, txHash } = req.body;
  const { client } = req.app.locals.blInstance;

  if (!client) { res.send(utils.errorResponse(500, "No blockchain instance provided")) }

  const excessKeypair = blockchain.getNewKeypairEncrypted(client);
  if (!excessKeypair) { res.send(utils.errorResponse(500, "Couldn't generate excess keypair")) }

  const allKeypairs = utils.getAllKeypairs(req.app.locals.db);
  const sendReceiptResp = await client.makeReceiptPayment(address, amount, txHash, allKeypairs, excessKeypair);

  if (sendReceiptResp.status == 'Success') {
    db.setDb(db.redisClient, excessKeypair, excessKeypair);
    res.send(utils.constructResponse(200, 'OK', { message: 'Payment sent' }));
  }

  logger.logHeaderError('Error Sending Blockchain Item', sendReceiptResp);
  res.send(utils.errorResponse(500, "Couldn't send payment"));
});

module.exports = router;
