var db_api = require('../../models/db_api');
var db = require('../../db.js');

// Connect to test database
db.connect(db.MODE_TEST, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1)
    } else {
        console.log('connected to test database');
    }
});

describe('Normal functionality', function() {
    it('Test add_deck expected input', function(done) {
        // fails if primary key (userid, deckid) isn't unique, need a real test db
        db_api.add_deck(122, 123, 'Test deckcode', function(err, insertId) {
            if (err) {
                console.log(err.message);
                done(new Error('Unable to add deck with expected input'));
            }
            else {
                // make sure deckcode got added
                db.get().query('SELECT deckcode FROM ownedBy ' +
                    'WHERE userid = 1 AND deckcode = 123', function(err, result) {
                    if (err) {
                        console.log(err.message);
                        return done(new Error('Unable to read from database'));
                    }

                    // if a single result, element added correctly
                    if(result.length == 1) {
                        done();
                    } else {
                        done(new Error('No deck was added'));
                    }

                })
            }
        });

    })
});