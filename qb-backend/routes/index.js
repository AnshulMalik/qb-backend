var express = require('express');
var app = express();
var router = express.Router();
var auth = require('../lib/api/auth');

router.use('/auth', auth);

module.exports = router;
