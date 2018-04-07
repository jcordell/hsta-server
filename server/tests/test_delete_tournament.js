var supertest = require('supertest');
var should = require('should');
var server = supertest.agent("http://localhost:3000");

var db_api = require('../models/db_api');
var db = require('../db.js');

// connect to app (hearthstone server)
var app = require('../app.js')('test');

// start app on port 3000
//app.listen(3000);

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
    it('Delete tournament with expected input', function (done) {

        // remove decklist (if exists)
        db.get().query('INSERT INTO tournament (name, numDecks) VALUES(\'delete_test_tournament\', 3)', function (err, result) {
            if (err) done(new Error(err.message));

            // test create tournament with expected input
            console.log(result);
            server.get('/api/delete_tournament?tournamentid=' + result.insertId)
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
    })
});