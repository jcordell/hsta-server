var db_api = require('../models/db_api');
var db = require('../db.js');

// connect to app (hearthstone server)
var app = require('../app.js')('test');

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

    db_api.create_match(12, 34, 12, 1, 1, function(err, result)
        {

            if(err) {
                console.log("Error creating match");
                done(err.message);
            }
            else{
                db_api.get_tournaments(6, function(err, result) {
                    console.log("wat");
                    console.log(JSON.stringify(result));
                    console.log(result);
                })
            }
        });