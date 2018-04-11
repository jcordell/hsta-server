var db_api = require('../models/db_api');
var db = require('../db.js');
var deckstrings = require("deckstrings");

decode = function(deckcode) {
    try {
        return deckstrings.decode(deckcode);
    } catch (e) {
        return null
    }
}

// Connect to test database
db.connect(db.MODE_TEST, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1)
    } else {
        console.log('connected to test database');
    }
});

var delId=0;

describe('Test get_match() functionality', function() {
    it('Test get_match() for single match', function(done) {

        db_api.create_match(12, 34, 12, 1, function(err, result)
        {

            if(err)
            {
                console.log("Error creating match");
                done(err.message);
            }
            db_api.get_match(result, function(err, data)
            {
                if(err)
                {
                    console.log(JSON.stringify(data));
                    done(err.message);
                }
                else {
                    if ((data[0].matchid === result) && (data[0].homeTeamId === 12) &&
                        (data[0].awayTeamId === 34) && (data[0].winningTeamId === 12)
                        && (data[0].isValid === 1))
                    {
                        delId= result; // dave id to delete entry after test

                        console.log(JSON.stringify(data)); //DEBUG
                        done();

                    }
                }
            });

        });

    })
});