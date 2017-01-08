var express = require('express');
var app = express();
var router = express.Router();

var create = require('./create');
var join = require('./join');
var invite = require('./invite');
var questions = require('./questions/index');

router.use('/create', create);
router.use('/join', join);
router.use('/invite', invite);
router.use('/questions', questions);