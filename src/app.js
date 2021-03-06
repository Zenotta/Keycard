const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// ======= Local Imports ======= //

const db = require('./db');
const utils = require('./utils');
const cache = require('./cache');
const indexRouter = require('./routes');
const blockchain = require('./blockchain');
const internalLogger = require('./logger');
const chalk = require('chalk');

const app = express();

// ======= Config ======= //

const {
  passPhrase,
  intercomHost,
  computeHost,
  cacheCapacity,
  verbose,
  seedPhrase
} = utils.getConfigArgs();

if (verbose) {
  console.log(chalk.green('Verbose mode enabled'));
  console.log('passPhrase', passPhrase);
  console.log('intercomHost', intercomHost);
  console.log('computeHost', computeHost);
  console.log('cacheCapacity', cacheCapacity);
}

// ======= Server Setup ======= //

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

internalLogger.banner();


// ======= DB Setup ======= //

Promise.resolve(db.init());
app.locals.db = db.redisClient;
app.locals.verbose = new internalLogger.VerboseLogger(verbose);


// ======= Blockchain ======= //

db.getDb(db.redisClient, 'mkey')
  .then(async (mkey) => {
    // If we don't have an existing key
    if (!mkey) {
      console.log(chalk.yellow('No mkey found in db. Generating new blockchain instance'));
      console.log('seedPhrase', seedPhrase ? 'found' : 'not found');

      const result = seedPhrase ? 
        await blockchain.createZenottaInstanceFromSeed(computeHost, intercomHost, passPhrase, db.redisClient, seedPhrase) : 
        await blockchain.generateNewZenottaInstance(computeHost, intercomHost, passPhrase, db.redisClient);

      db.setDb(db.redisClient, 'sp', result.seedPhrase);

      return result;
    }

    mkey = JSON.parse(mkey);
    console.log('Mkey found. Initialising blockchain instance');
    return await blockchain.createZenottaInstance(computeHost, intercomHost, passPhrase, mkey);
  })
  .then(async (blInstance) => {
    app.locals.blInstance = blInstance;
    const blClient = app.locals.blInstance.client;

    return await cache.initBalanceCache(db.redisClient, blClient, cacheCapacity);
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
