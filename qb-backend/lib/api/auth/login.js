const express = require('express');
const router = express.Router();
const Response = require('../../response');
const statusCodes = require('../../statusCodes');
const userService = require('../../services/userService');

router.post('/', (req, res) => {
	let r = new Response();
	console.log(r);

	let name = req.body.username;
	let pass = req.body.pass;

	userService.login(name, pass).then((result) => {
		r.status = statusCodes.SUCCESS;
		r.data = "Login successfull";
		return res.json(r);
	}).catch((err) => {
		r.status = statusCodes.INVALID_CREDENTIALS;
		r.data = "Login failed";
		return res.json(r);
	});

});
	

module.exports = router;