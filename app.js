const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const passPhrase = process.argv[2];

// Local imports
const utils = require('./utils');
const config = require('./config');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const blockchain = require('./blockchain');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Blockchain
app.locals.blInstance = blockchain.createZenottaInstance(config.computeHost, config.intercomHost, passPhrase);

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
