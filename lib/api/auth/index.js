let express = require('express');
let app = express();
let router = express.Router();

let login = require('./login');
let signup = require('./signup');

router.use('/login', login);
router.use('/signup', signup);

module.exports = router;
