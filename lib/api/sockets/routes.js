/*
    Contains special and generic socket routes that we need to listen
 */
module.exports = {
    joinContest: '^\\/contest\\/(\\d+)$',   // /contest/:id

    global: '[\/]'                          // / (root of the app)
};
