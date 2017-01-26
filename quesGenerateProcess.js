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
const generateGrid = require('./cubeGeneration/algo');
const contestService = require('./lib/services/contestService');
const questionService = require('./lib/services/questionService');
const dictionaryService = require('./lib/services/dictionaryService');
const MAX_WORDS_IN_GRID = 2;
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
						let words = Array.from(ans);
						ques.solutions.map((solution) => { words.push(solution.answer.toUpperCase()); });

                        let result = generateGrid(words);
						console.log('Generated ', result);
                        return new Promise((resolve, reject) => {
                            if(result) {
                                questions[ques._id] = {
                                    words: result.words,
                                    grid: result.grid
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
