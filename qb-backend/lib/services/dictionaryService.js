class Dictionary {

    constructor() {
        require('../api/db').then((db) => {
            this.db = db;
        }).catch((err) => {
            console.trace('Error occured while requiring database', err);
        });
    }

    create(obj) {
    }

    getRandomWords(count, language) {
        /*
            Returns count number of random words from dictionary
         */
        return new Promise((resolve, reject) => {
            this.get(language).then((dict) => {
                let output = new Set();
                while(output.size < count) {
                    output.add(dict.words[Math.floor(Math.random() * dict.words.length)].toUpperCase());
                }
                resolve(output);
            }).catch((err) => {
                console.log('Failed to fetch dictionary', language);
                reject(err);
            });
        });
    }

    get(language = 'english') {
        /*
            Returns the whole dictionary of a language
         */
        return new Promise((resolve, reject) => {
            this.db.collection('dictionaries').findOne({
                language
            }, (err, result) => {
                if(err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
}

module.exports = new Dictionary();
