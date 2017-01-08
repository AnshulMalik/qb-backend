var express = require('express');
var app = express();
var router = express.Router();

var contests = require('../lib/api/contests');
router.use('/contests', contests);


module.exports = router;
