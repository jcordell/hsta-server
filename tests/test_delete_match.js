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

describe('Test delete_match functionality', function() {
    it('Delete single match', function (done) {

        //insert single match (to be deleted)
        db.get().query('INSERT INTO matches (homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid) VALUES(1234, 5678, 1234, 1, 1)', function (err, result)
        {
            if (err)
            {
                console.log("error when inserting into table 'MATCHES'");
                done(new Error(err.message));
            }

            // test delete
            server.get('/api/delete_match?matchid=' + result.insertId)
                .expect(200)
                .end(function (err, res)
                {
                    if (err)
                        done(new Error(err.message));

                    res.status.should.equal(200);

                    // response should equal json string, weird commat formatting
                    res.text.should.equal('\{\"success\":true}');
                    done();
                })
        });
    })
});