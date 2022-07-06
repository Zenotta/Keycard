const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const passPhrase = process.argv[2];


// ======= Local Imports ======= //

const db = require('./src/db');
const utils = require('./src/utils');
const config = require('./config');
const cache = require('./src/cache');
const indexRouter = require('./src/routes');
const blockchain = require('./src/blockchain');
const internalLogger = require('./src/logger');
const chalk = require('chalk');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

internalLogger.banner();



// ======= DB Setup ======= //

Promise.resolve(db.init());
app.locals.db = db.redisClient;


// ======= Blockchain ======= //

db.getDb(db.redisClient, 'mkey')
  .then(async (mkey) => {
    // If we don't have an existing key
    if (!mkey) {
      console.log(chalk.yellow('No mkey found in db. Generating new blockchain instance'));
      return await blockchain.generateNewZenottaInstance(config.computeHost, config.intercomHost, passPhrase, db.redisClient);

    }

    mkey = JSON.parse(mkey);
    console.log('Mkey found. Initialising blockchain instance');
    return await blockchain.createZenottaInstance(config.computeHost, config.intercomHost, passPhrase, mkey);
  })
  .then(async (blInstance) => {
    app.locals.blInstance = blInstance;
    const blClient = app.locals.blInstance.client;

    return await cache.initBalanceCache(db.redisClient, blClient, config.cacheCapacity);
  })
  .then(cache => {

    // ======= Cache ======= //

    console.log(chalk.green('Balance cache initialised'));
    app.locals.balanceCache = cache;
  });



// ======= Routes ======= //

app.use('/', indexRouter);


// ======= Catch 404 and Forward to Error Handler ======= //

app.use(function (_req, _res, next) {
  next(createError(404));
});


// ======= Error Handler ======= //

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(utils.errorResponse(err.status || 500, "Couldn't connect to requested route"));
});


// Handle runtime exceptions
process.on('uncaughtException', (e) => {
  internalLogger.logHeaderError('unhandledException', e.message);
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  internalLogger.logHeaderError('unhandledRejection', e);
  process.exit(1);
});


module.exports = app;
