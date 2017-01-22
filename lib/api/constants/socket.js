module.exports = {
    events: {
        listContacts: 'list-contacts',
        checkInstall: 'check-install',
        joinContest: 'join-contest',
        createContest: 'create-contest',
        getQuestions: 'get-questions',
        submitAnswer: 'submit-answer',
        listLive: 'list-live',
        listLanguages: 'list-categories',
        getLeaderboard: 'get-leaderboard',
    },
    emit: {
        listContacts: 'list-contacts-complete',
        checkInstall: 'check-install-complete',
        createContest: 'create-contest-complete',
        listLive: 'list-live-complete',
        joinContest: 'join-contest-complete',
        getQuestions: 'get-questions-complete',
        error: 'err',
        installRequired: 'install-required',
        leaderboardUpdated: 'leaderboard-updated',
        submitAnswer: 'submit-answer-complete',
        listLanguages: 'list-categories-complete',
        userJoined: 'user-joined',
        getLeaderboard: 'get-leaderboard-complete'
    }
};
