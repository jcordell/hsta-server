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

describe('request(app)', function() {
    it('Join tournament no matches or decks submitted with expected input', function (done) {

        // remove decklist (if exists)
        db.get().query('INSERT INTO tournament (name, numDecks, userid) VALUES(\'join_tournament_test\', 3, 5)', function (err, result) {
            if (err) done(new Error(err.message));

            // test join tournament with expected input
            server.get('/api/join_tournament?tournamentid=' + result.insertId + '&userid=10')
                .expect(200)
                .end(function (err, res) {
                    if (err)
                        done(new Error(err.message));

                    res.status.should.equal(200);

                    // response should equal json string, weird commat formatting
                    res.text.should.equal('\{\"success\":true,\"decks\":[],\"deck_names\":[],\"numDecks\":3,\"matches_played\":false}');
                    done();
                })
        });
    })
});