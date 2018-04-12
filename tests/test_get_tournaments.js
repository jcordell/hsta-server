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

db_api.create_tournament("test_get",3,6, function(done){});

describe('Test get_tournaments() functionality', function() {
    it('Test get_tournaments() for a user with one tournament', function(done) {

        db_api.create_match(12, 34, 12, 1, 1, function(err, result)
        {

            if(err) {
                console.log("Error creating match");
                done(err.message);
            }
            else{
                db_api.get_tournaments(6, function(err, result) {
                    console.log("wat")
                    console.log(JSON.stringify(result));
                    console.log(result);
                })
            }
        });
        done();
    });
});