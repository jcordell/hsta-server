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
    it('get tournament battletags with expected input', function (done) {

        server.get('/api/get_tournament_battletags?tournamentid=' + 333 + '&userid=10')
            .expect(200)
            .end(function (err, res) {
                if (err)
                    done(new Error(err.message));

                res.status.should.equal(200);

                // response should equal json string, weird commat formatting
                res.text.should.equal('\{\"success\":true,\"battletags\":[\"fakebattletag6@gmail.com\",\"fakebattletag7@gmail.com\"]}');
                done();
            })
    });
});