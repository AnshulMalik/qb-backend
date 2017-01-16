/*
    This process listens for ipc messages on socket
    which are sent be main application and generate
    questions for a contest

    New requests are inserted into queue and processed
    one by one
 */

const util = require('./lib/util');
const ipc = require('node-ipc');
const crypto = require('crypto');
const contestService = require('./lib/services/contestService');
const questionService = require('./lib/services/questionService');
const dictionaryService = require('./lib/services/dictionaryService');
const MAX_WORDS_IN_GRID = 5;
const SLEEP_TIME = 10000; // Queue is checked every 5 seconds if empty
const GRID_ROWS = 5;
const GRID_COLS = GRID_ROWS * 4;

class Queue {
	constructor() {
		this.array = [];
	}

	push(contestId) {
		this.array.push(contestId);
		return true;
	}

	pop() {
		if(this.array.length) {
			return this.array.shift();
		}
		return null;
	}
}

let queue = new Queue();

ipc.config.id = 'generateProcess';
ipc.config.retry = 15000;

ipc.serve(() => {
	ipc.server.on(
		'app.message', (data, socket) => {
			queue.push(data.contestId);
		}
	);
});
// IPC server listens on local unix socket for events to occur
ipc.server.start();

class Grid {
    constructor(config) {
        let i, j;
        this.rows = GRID_ROWS;
        this.cols = GRID_COLS;
        this.MAX_RETRIES = config.maxRetries || 50;
        this.retries = 0;         // Number of max tries to genereate the grid
        this.placeRetries = {};

        // Initialize grid with # signs
        this.grid = new Array(this.rows);
        for(i = 0; i < this.rows; i++) {
            this.grid[i] = new Array(this.cols);
            for(j = 0; j < this.cols; j++) {
                this.grid[i][j] = '#';
            }
        }

        // Contains words already in the grid
        this.wordsOnGrid = []; // Array of {word, start position, direction}

        this.words = config.answers.concat(config.bonuses);
        this.words.sort((a, b) => {
            // Sort the words by length, since we want the largest word to be
            // placed on the grid first
            return a.length < b.length;
        });

        // Consider current position as origin and calculate next
        // position base on direction, increment in x only means move
        // in right, increment in y only means move up
        // 0: up    1: right,   2: down,    3: left
        this.directions = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }];
    }

    placeOnGrid(text) {
        /*
            Tries to place a word on to the grid by randomly picking
            coordinates.

         */
        this.placeRetries[text]++;
        if(this.placeRetries[text] > this.MAX_RETRIES) {
            return false;
        }
        let { x, y } = this.getRandomCoordinates();
        let dir = this.getDirection({text, start: {x, y}} );
        if(dir != -1) {
            return this.wordsOnGrid.push({
                text,
                start: {
                    x,
                    y
                },
                end: this.endFromStart({text, start: { x, y }, dir}),
                dir
            });
        }
        if(this.placeOnGrid(text)) {
            return true;
        }

        return false;
    }

    getRandomCoordinates() {
        /*
            Finds are returns random coordinates on the grid
         */
        return {
            x: Math.floor(Math.random() * this.cols),
            y: Math.floor(Math.random() * this.rows)
        };
    }

    getDirection(word) {
        /*
            Given word, start position, returns possible direction, if possible
        */
        let curDir = Math.floor(Math.random() * 4);
        let checked = [];   // Already enumerated directions
        while(checked.length < 4) {
            word.dir = curDir;
            checked.push(curDir);
            if(this.isCompatible(word)) {
                return curDir;
            }
            curDir = (curDir++) % 4;
        }

        return -1;  // Word can't be placed on the give coordinate
    }

    isCompatible(newWord) {
        /*
            Given word, coordinates and direction, finds
            whether it fits into the grid right
        */

        let end = this.endFromStart(newWord);
        // console.log(newWord, end);
        if(end.x >= this.cols || end.y >= this.rows || end.x < 0 || end.y < 0) {
            return false;
        }
        newWord.end = end;

        for(let word of this.wordsOnGrid) {
            // console.log("comparing", word, newWord);
            let {ix, iy} = this.findIntersection(word, newWord);
            if(ix != -1 && iy != -1) {
                // console.log('not compatible', word, newWord);
                return false;
            }
        }
        return true;
    }

    findIntersection(first, second) {
        /*
            Given two words, finds their intersection point if present
         */

        let slope1 = Math.abs((first.start.y - first.end.y)/(first.start.x - first.end.x));
        let slope2 = Math.abs((second.start.y - second.end.y)/(second.start.x - second.end.x));
        if(slope1 == Infinity && slope2 === 0) {
            // | -
            let resy = util.liesBetween(second.start.y, first.start.y, first.end.y);
            let resx = util.liesBetween(first.start.x, second.start.x, second.end.x);
            if(resy && resx)
                return { ix: 0, iy: 0 };
        }
        else if(slope1 === 0 && slope2 == Infinity) {
            // - |
            let resx = util.liesBetween(second.start.x, first.start.x, first.end.x);
            let resy = util.liesBetween(first.start.y, second.start.y, second.end.y);
            if(resy && resx)
                return { ix: 0, iy: 0 };
        }
        else if(slope1 == Infinity && slope2 == Infinity) {
            // | |
            if(first.start.x == second.start.x) {
                let max = Math.max(first.start.y, first.end.y, second.start.y, second.end.y);
                let min = Math.min(first.start.y, first.end.y, second.start.y, second.end.y);
                if((max - min) < (first.text.length + second.text.length))
                    return { ix: 0, iy: 0 };
            }
        }
        else if(slope1 === 0 && slope2 === 0) {
            // - -
            if(first.start.y == second.start.y) {
                let max = Math.max(first.start.x, first.end.x, second.start.x, second.end.x);
                let min = Math.min(first.start.x, first.end.x, second.start.x, second.end.x);
                if((max - min) < (first.text.length + second.text.length))
                    return { ix: 0, iy: 0 };
            }
        }

        return { ix: -1, iy: -1 };
    }

    generate() {
        this.retries++;
        if(this.retries > this.MAX_RETRIES) {
            return false;
        }
        let i, j, k;
        for(let word of this.words) {
            this.placeRetries[word] = 0;
            if(this.placeOnGrid(word) === false) {
                // Since we can't place a word into the grid, so, retry
                this.wordsOnGrid = [];
                if(!this.generate()) {
                    return false;
                }

            }
        }

        for(let word of this.wordsOnGrid) {
            /*
                Once all words are assigned their positions, finally place the
                characters into the grid array
             */
            // console.log(word.text, word.dir);
            k = 0;
            for(i = word.start.x; (this.directions[word.dir].x < 0)? (i >= word.end.x): (i <= word.end.x); (this.directions[word.dir].x < 0)? (i--):(i++)) {
                for(j = word.start.y; (this.directions[word.dir].y < 0)? (j >= word.end.y): (j <= word.end.y); (this.directions[word.dir].y < 0)? (j--):(j++)) {
                    // console.log(i, j, k, word.text.length);
                    if(word.text.length > k) {
                        // Since j (column in array) means x axis
                        // and i(rows in array means y axis)
                        this.grid[j][i] = word.text[k++];
                    }
                }
            }
        }

        // Replace # with random characters
        for(i = 0; i < this.rows; i++) {
            for(j = 0; j < this.cols; j++) {
                if(this.grid[i][j] == '#')
                    this.grid[i][j] = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
            }
        }

        // Split the grid into faces
        let faces = [[], [], [], []];
        for(i = 0; i < 4; i++) {
            let s = '';
            for(j = 0; j < this.rows; j++) {
                s += this.grid[j].splice(0, this.cols/4).join('');
            }
            faces[i] = s;
        }
        return faces;
    }

    endFromStart(word) {
        /*
            Given the starting coordinates and direction, computes it's
            ending coordinates
         */
        return {
            x: word.start.x + word.text.length * this.directions[word.dir].x,
            y: word.start.y + word.text.length * this.directions[word.dir].y
        };
    }

    getWordsOnGrid() {
        let obj = {};
        let str = '';
        this.wordsOnGrid.map((word) => {
            obj[word.text] = {};
            obj[word.text].start = [word.start.x, word.start.y];
            // Creates hash from start coordinates and text of word
            str = word.start.x + ',' + word.start.y + ',' + word.text;
            obj[word.text].hash = crypto.createHash('md4').update(str).digest("hex");
        });

        return obj;
    }
}

let listen = () => {
    let contestId = queue.pop();

    if(contestId) {
        console.log('Genereating questions for', contestId);
        questionService.getRandomQuestions(contestId).then((contestQuestions) => {
            let questions  = {};
            Promise.all(
                contestQuestions.map((ques) => {
                    // Get random words from a dictionary
                    return dictionaryService.getRandomWords(MAX_WORDS_IN_GRID - ques.solutions.length, 'english').then((ans) => {
                        let g = {
                            bonuses: Array.from(ans),
                            answers: ques.solutions.map((solution) => { return solution.answer.toUpperCase(); })
                        };

                        let grid = new Grid(g);
                        let result = grid.generate();

                        return new Promise((resolve, reject) => {
                            if(result) {
                                questions[ques._id] = {
                                    words: grid.getWordsOnGrid(),
                                    grid: result
                                };
                                resolve('complete');
                            }
                            else {
                                console.log('Can\'t generate grid for contest', contestId);
                                reject('');
                            }
                        });
                    });
                })
            ).then((data) => {
                contestService.setQuestions(contestId, questions).then((response) => {
                    console.log('Questions generated for', contestId);
                });
                listen();
            }).catch((err) => {
                console.trace(err);
                listen();
            });
        });

    }
    else {
        setTimeout(listen, SLEEP_TIME);
    }
};

listen();
