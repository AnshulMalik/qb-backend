/*
	Response structure for sending responses
*/

class Response {

	constructor(status, data) {
		this.status = status;
		this.data = data || "";
		this.toString = function() {
			return JSON.stringify({
			status: this.status,
	      	data: this.data
	    	});
	 	};

	}

}

module.exports = Response;
