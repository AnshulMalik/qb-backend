var express = require('express');
var app = express();
var router = express.Router();
var contests = require('../lib/api/contests');
var auth = require('../lib/api/auth');

router.use('/contests', contests);
router.use('/auth', auth);

module.exports = router;
