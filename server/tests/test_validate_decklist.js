var supertest = require('supertest');
var should = require('should');
var server = supertest.agent("http://localhost:3000");

var db_api = require('../models/db_api');
var db = require('../db.js');

// connect to app (hearthstone server)
var app = require('../app.js')('test');

// start app on port 3000
app.listen(3000);

// Connect to test database
db.connect(db.MODE_PRODUCTION, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1)
    } else {
        console.log('connected to test database');
    }
});

describe('request(app)', function() {
    it('Deck is not in submitted decklists with expected input test', function(done) {

        // remove decklist (if exists)
        db.get().query('DELETE FROM ownedBy WHERE userid = 1 AND deckcode = \'test_deckcode\'', function(err, result) {
            if(err) done(new Error(err.message));

            // test getting api with expecting no validate
            server.get('/api/validate_decklist?userid=1&deckcode=test_deckcode')
                .expect(200)
                .end ( function(err, res) {
                    if (err)
                        done(new Error(err.message));

                    res.status.should.equal(200);

                    // response should equal json string, weird commat formatting
                    res.text.should.equal('\{\"hasDeck\":false,\"error\":null\}');
                    done();
                })
        });
    })


    it('Deck is in submitted decklists with expected input test', function(done) {

        // insert values (if not existing)
        var values = [2, 'test_deckcode', 'test_deckname'];
        db.get().query('INSERT IGNORE INTO ownedBy (userid, deckcode, deckname) VALUES(?,?,?)', values, function(err, result) {
            if (err) {
                done(new Error(err.message));
            }

            // test getting api with expecting no validate
            server.get('/api/validate_decklist?userid=2&deckcode=test_deckcode')
                .expect(200)
                .end ( function(err, res) {
                    if (err)
                        done(new Error(err.message));

                    res.status.should.equal(200);

                    // response should equal json string, weird commat formatting
                    console.log(res.text);
                    res.text.should.equal('\{\"hasDeck\":true\}');
                    done();
                })
        })
    })
});