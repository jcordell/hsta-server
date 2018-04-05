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

describe('Get Decklists Normal functionality', function() {
    it('Test get decklists expected input', function(done) {

        // fails if primary key (userid, deckid) isn't unique, need a real test db
        db_api.get_user_decklists(15, function(err, data) {
            if (err) {
                console.log(err.message);
                done(new Error('Unable to obtain decklist with expected input'));
            }
            else {
                // make sure deck_code has been returned
                var deckcodes = [];
                var cardCounter;
                var deckHas30 = false;
                var decoded_deckstring = [];
                for (var i = 0; i < data.length; i++) {
                    //get decoded data
                    deckcodes[i] = data[i].deckcode;

                    decoded_deckstring = decode(deckcodes[i]);
                    // if unable to decode or invalid deckstring
                    if (decoded_deckstring == null) {
                        done(new Error('Deckstring is null'));
                    }
                    cardCounter = 0;
                    for (var x = 0; x < decoded_deckstring.cards.length; x++)
                    {
                        cardCounter+= decoded_deckstring.cards[x][1];
                    }
                    if (cardCounter === 30)
                        deckHas30 = true;
                    else
                        done(new Error('Deck ' + i + 'has less than 30 cards'));

                }
                if (deckHas30)
                    done();
                else
                    done(new Error('This error should not be thrown'));

            }
        });

    })
});