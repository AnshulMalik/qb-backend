/*
	Response structure for sending responses
*/

function Response(status, data) {
	this.status = status;
	this.data = data || "";
	this.toString = function() {
		return JSON.stringify({
		status: this.status,
      	data: this.data
    	});
 	};


}

module.exports = Response;
