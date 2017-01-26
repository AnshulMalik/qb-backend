const crypto = require('crypto');
var count;
var positions;
var positionsOfAllWords = [];
var words;
var counterArray = [];
var checkSet;
var MAX_SIZE = 5;
var data;
var startPositions = [];

var getRandom = () => {
	return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

var getRandomPosition = (count) => {
	return Math.floor(Math.random() * count);
}

var getRandomDirection = () => {
	let direction = Math.floor(Math.random() * count);
	return direction % 4;
}

var check = (pos, next) => {

	let size = MAX_SIZE*4;
	let newPosition;
	//console.log(pos, next);

	checkSet.add(next);


	if(next == 0) {
		newPosition = pos + 1;

		// Checking the boundary values
		for(let i = 1; i <= MAX_SIZE; i++) {
			if(pos == (size*i - 1)) {
				newPosition = pos + 1 - size;
			}
		}

		//console.log(pos, next, data[newPosition]);
		if(data[newPosition] != "#") {
			if(Array.from(checkSet).length == 4) {
				return run();
			}
			return check(pos, getRandomDirection());
		}

		return newPosition;
	}

	if(next == 1) {
		newPosition = pos - size;

		// Checking whether the alloted position is empty or not
		// and changing its position
		if(pos > 0 && pos < size) {
			newPosition = pos + size;
			if(data[newPosition] != '#') {
				newPosition = pos - 1;
				if(data[newPosition] != '#') {
					newPosition = pos + 1;
					if(data[newPosition] != '#') {
						newPosition = 10000;
					}
				}
			}
		}

		//console.log(pos, next, data[newPosition]);

		if(data[newPosition] != "#") {
			if(Array.from(checkSet).length == 4) {
				return run();
			}
			return check(pos, getRandomDirection());
		}

		return newPosition;
	}

	if(next == 2) {
		newPosition = pos - 1;

		// Checking the boundary values
		for(let i = 1; i < MAX_SIZE; i++) {
			if(pos == (MAX_SIZE*4*i)) {
				newPosition = pos - 4*MAX_SIZE;
			}
		}

		if(pos == 0) {
			newPosition = pos + size - 1;
			if(data[newPosition] != '#') {
				newPosition = pos + size;
				if(data[newPosition] != '#') {
					newPosition = 10000;
				}
			}
		}

		//console.log(pos, next, data[newPosition]);

		if(data[newPosition] != "#") {
			if(Array.from(checkSet).length == 4) {
				return run();
			}
			return check(pos, getRandomDirection());
		}

		return newPosition;
	}

	if(next == 3) {
		newPosition = pos + size;

		// Checking whether the alloted position is empty or not
		// and changing its position
		if(newPosition >= count) {
			newPosition = pos - size;
			if(data[newPosition] != '#') {
				newPosition = pos - 1;
				if(data[newPosition] != '#') {
					newPosition = pos + 1;
					if(data[newPosition] != '#') {
						newPosition = 10000;
					}
				}
			}
		}
		//console.log(pos, next, data[newPosition]);

		if(data[newPosition] != "#") {
			if(Array.from(checkSet).length == 4) {
				return run();
			}
			return check(pos, getRandomDirection());
		}

		return newPosition;
	}
}


var box = (size) => {


	let row = size*4;
	let col = size;
	count = row*col;

	data = [];

    for(let i = 0; i < count; i++) {
    	data.push('#');
    }

}

var putName = (name) => {

	let pos = getRandomPosition(count);
	//console.log(pos,count);
	let newPosition = pos;
	positions = []

	for(let i = 0; i < name.length; i++) {

		try {
			checkSet = new Set();
			newPosition = check(pos, getRandomDirection());
			pos = newPosition;
			data[newPosition] = name[i];
			positions.push(newPosition);
		}
		catch(err) {
			//console.log(err);
			return 0;
		}

	}
}

// Makes sure that the answer doesn't move more than 3 faces/
var numberOfFacesCovered = () => {

	let rangeArray = positions.map((num) => num % (4 * MAX_SIZE));
	let maxFace = Math.max(...rangeArray)/5;
	let minFace = Math.min(...rangeArray)/5;
	let range = Math.abs(maxFace - minFace);

	// Since this will be folded this isn't a violation
	if(maxFace == 4 && maxFace == 1) {
			return 1;
	}

	return range;
}

var run = () => {

	//positionsOfAllWords = [[], [], [], []];
	//counterArray = [0, 0, 0, 0];
	positionsOfAllWords = [];
	counterArray = [];

	for(let i = 0; i < MAX_SIZE; i++) {
		positionsOfAllWords.push([]);
		counterArray.push(0);

	}

	box(MAX_SIZE);
	for(let i = 0; i < words.length; i++) {
		startPositions.push(0);
	}

	for(let i = 0; i < words.length; i++) {
		allotName(i);
		startPositions[i] = positions[0];
	}
}

var allotName = (functionId) => {

	let res;
	res = 1;

	res = putName(words[functionId]);
	let range = numberOfFacesCovered();

	if(res == 0 || range > 1) {
		for(let i = 0; i < positions.length; i++) {
			data[positions[i]] = '#';
		}

		if(counterArray[functionId] >= 5) {
			if(functionId == 0) {
				return run();
			}
			else {
				for(let i = 0; i < positionsOfAllWords[functionId].length; i++) {
					data[positionsOfAllWords[functionId][i]] = '#';
				}
				counterArray[functionId] = 0;
				return allotName(functionId - 1);
			}
		}

		positionsOfAllWords[0] = positions;

		counterArray[functionId] += 1;
		return allotName(functionId);
	}
}

module.exports = (wordsToInsert) => {
	console.log(wordsToInsert);
	words = wordsToInsert;
	run();

	let t = 0;
	for(let i = 0; i < MAX_SIZE; i++) {
		let str = "";
		for(let j = 0; j < MAX_SIZE*4; j++) {
			str += data[t] + ' ';
			t+=1;
		}
		console.log(str);
	}

	let temp = 0;
	let grid = [];
	for(let i = 0; i < MAX_SIZE; i++) {
		grid.push([]);
		for(let j = 0; j < MAX_SIZE*4; j++) {
			grid[i].push(data[temp]);
			temp += 1;
		}
	}

	// Split the grid into faces
	let faces = [[], [], [], []];
	for(i = 0; i < 4; i++) {
		let s = '';
		for(j = 0; j < MAX_SIZE; j++) {
			s += grid[j].splice(0, MAX_SIZE).join('');
		}
		faces[i] = s;
	}
//	console.log(faces);

	let obj = {};
	console.log(faces);
	words.map((word, i) => {
		obj[word] = {};
		obj[word].start = [ startPositions[i] % (MAX_SIZE * 4), Math.floor(startPositions[i] / (MAX_SIZE * 4)) ];
		let str = obj[word].start[0] + ',' + obj[word].start[1] + ',' + word;
		obj[word].hash = crypto.createHash('md4').update(str).digest("hex");
	});
	
	return {
		words: obj,
		grid: faces
	};
};
