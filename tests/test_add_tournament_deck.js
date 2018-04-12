var supertest = require('supertest');
var should = require('should');
var server = supertest.agent("http://localhost:3000");

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

describe('Add tournament deck functionality', function() {
    it('Add tournament deck with one deckcode', function (done) {

        // remove decklist (if exists)


            // test create tournament with expected input
            server.get('/api/add_tournament_deck?userid=4&tournamentid=1&deckcode=dc1')

                .expect(200)
                .end(function (err, res) {
                    if (err)
                        done(new Error(err.message));

                    res.status.should.equal(200);

                    // response should equal json string, weird commat formatting
                    res.text.should.equal('\{\"success\":true}');
                    done();
                })
        });
    it('Add tournament deck with multiple deckcodes', function(done) {
        server.get('/api/add_tournament_deck?userid=4&tournamentid=1&deckcode=dc1,dc2,dc3')

            .expect(200)
            .end(function (err, res) {
                if (err)
                    done(new Error(err.message));

                res.status.should.equal(200);

                // response should equal json string, weird commat formatting
                res.text.should.equal('\{\"success\":true}');
                done();
            })
    })
});