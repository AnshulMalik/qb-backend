const express = require('express');
const router = express.Router();
const Response = require('../../response');
const statusCodes = require('../../statusCodes');
const userService = require('../../services/userService');

router.post('/', (req, res) => {
	let r = new Response();

	let name = req.body.username;
	let pass = req.body.pass;
	let email = req.body.email;

	userService.checkDuplicate(
		name,
		email
	).then((result) => {
		userService.create({
			name,
			pass,
			email
		}).then((result) => {
	        r.status = statusCodes.SUCCESS;
	        r.data = "Signup successfull";
	        r.id = result.insertedId;
	        return res.json(r);
		}).catch((err) => {
	        r.status = statusCodes.SERVER_ERROR;
	        r.data = 'Error occured while creating user. ' + err;
	        return res.json(r)
	    });
	}).catch((err) => {
		res.send(err);
	});

	

});

module.exports = router;