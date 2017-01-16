module.exports = {
    events: {
        listContacts: 'list-contacts',
        checkInstall: 'check-install',
        joinContest: 'join-contest',
        createContest: 'create-contest',
        getQuestions: 'get-questions',
        submitAnswer: 'submit-answer'
    },
    emit: {
        listContacts: 'list-contacts-complete',
        checkInstall: 'check-install-complete',
        joinContest: 'join-contest-complete',
        getQuestions: 'get-questions-complete',
        error: 'err',
        installRequired: 'install-required',
        leaderboardUpdated: 'leaderboard-updated'
    }
};
