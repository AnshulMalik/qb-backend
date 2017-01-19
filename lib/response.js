/*
	Response structure for sending responses
*/

class Response {
	constructor(status, data) {
		this.status = status;
		this.data = data || "";
	}

	toString () {
		return JSON.stringify(this.toJson());
	}

	toJson()  {
		return {
			status: this.status,
			data: this.data
		};
	}
}

module.exports = Response;
