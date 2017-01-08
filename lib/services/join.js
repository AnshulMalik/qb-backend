var express = require('express');
var a = express();
var url; // To be filled later
var port; //To be defined as global later if needed.
var server = require('http').createServer(a);
var io = require('socket.io').listen(server);
var fs = require('fs');
var router = express.Router();
var db = require('../db');

class Join {

}

// New connection
io.sockets.on('connection', (socket) => {
	// Lets make a collection for storing the connections
	//db.instance.collection('connections').insert({'contestID': contestID, 'hostID': hostID, 'socket': socket});
	console.log(socket + ' joined the connections');

	// Disconnect
	socket.on('disconnect', (data) => {
		socket.disconnect(0);
	//	db.instance.collection('connections').remove({'socket': socket})
	});

//	socket.on('join', (data) => {
		while(Date.now() < start) {
			console.log("Contest will start in %s time.", start-Date.now());
		}

		// questions were inserted into the collections when the user creates a contest and now we fetch it from there
		var questions = db.instance.collection('questions').find({'contestID': contestID});

		if(Date.now() >= start && Date.now() < end) {
			//res.redirect(__dirname + '/questions.html');
			io.sockets.emit('questions', {questions: questions});
			console.log(name + ' started and questions are ' + questions);
		}

		// Once the contest gets ended they wont be able to see the questions
		io.sockets.emit('questions', {questions: []});
//	});

});

module.exports = new Join();