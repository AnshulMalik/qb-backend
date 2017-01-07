var express = require('express');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');
var eventListener = require('./listener');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

app.use(cors({credentials: true, origin: true}));

app.use('/listener', eventListener);
app.use('/', (req, res) => {
    res.end('OK');
});

module.exports = app;
