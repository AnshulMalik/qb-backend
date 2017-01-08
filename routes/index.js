var express = require('express');
var app = express();
var router = express.Router();

var contests = require('../api/contests/index');
router.use('/contests', contests);