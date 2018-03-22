var db_api = require('../models/db_api');
var db = require('../db.js');

// Connect to test database
db.connect(db.MODE_TEST, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1)
    } else {
        console.log('connected to test database');
    }
});

describe('Get Decklists Normal functionality', function() {
    it('Test get decklists expected input', function(done) {
        
        // fails if primary key (userid, deckid) isn't unique, need a real test db
        db_api.create_user('fakeemail@gmail.com', function(err, insertId) {
            if (err) {
                console.log(err.message);
                done(new Error('Unable to create user with expected input'));
            }
            else {
                // make sure user got added
                db.get().query('SELECT email FROM user ' +
                    'WHERE userid = 8 AND email = \'fakeemail@gmail.com\'', function(err, result) {
                    if (err) {
                        console.log(err.message);
                        return done(new Error('Unable to read from database'));
                    }

                    // if a single result, element added correctly
                    if(result.length === 1) {
                        done();
                    } else {
                        done(new Error('No user was added'));
                    }

                })
            }
        });

    })
});