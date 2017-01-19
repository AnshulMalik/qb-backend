const ipc=require('node-ipc');

ipc.config.id = 'client';
ipc.config.retry = 1000;


// 58745f3e591aa1f3eba024bd
/*
ipc.connectTo(
    'generateProcess',
    () => {
        ipc.of.generateProcess.on(
            'connect',
            () => {
                ipc.log('## Connected to generate process ##');
                ipc.of.generateProcess.emit(
                    'app.message',
                    {
                        contestId: '587218d8449d8a2efedb3775',
                    }
                );
            }
        );
        ipc.of.generateProcess.on(
            'disconnect',
            () => {
                ipc.log('Disconnected from generate process');
            }
        );
    }
);
*/

/*
const Contest = require('./lib/services/contestService');
const Question = require('./lib/services/questionService');

require('./lib/api/db').then((db) => {
    const contestService = new Contest(db);
    const questionService = new Question(db);
}
*/
