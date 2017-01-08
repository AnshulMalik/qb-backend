class Contest {

    constructor(db) {
        this.db = db;
    }

    create(obj) {
        console.log('Creating contest');
        return new Promise((resolve, reject) => {
            this.db.collection('contests').insertOne(obj, (err, result) => {
                if(err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
}

module.exports = Contest;
