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

describe('Test create_match functionality', function() {
    it('Create match with valid input', function (done) {

        // remove decklist (if exists)
        db.get().query('DELETE FROM matches WHERE matchid = 1', function (err, result) {
            if (err) done(new Error(err.message));

            // test create match passing in valid input

            server.get('/api/create_match?homeTeamId=012&awayTeamId=345&winningTeamId=012&tournamentid=1&isValid=1&matchDate=1000-01-01%2000:00:00')
                .expect(200)
                .end(function (err, res) {
                    if (err)
                        done(new Error(err.message));

                    res.status.should.equal(200);

                    res.text.should.equal('\{\"success\":true,\"id\":1\}');
                    done();
                })
        });
    })
});