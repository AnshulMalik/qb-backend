var express = require('express');
var app = express();
var router = express.Router();

var create = require('./create');

router.post('/', create);

module.exports = router;
