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

    before(function() {
        db_api.get_user_decklists(13, function (err, rows) {
            console.log(';lkasjdf;lkajsd;flkjasdkfj')
            console.log(rows);
        })
    })

    it('Deck played is in submitted decklists with expected input test', function(done) {

        server.post('/api/validate_decklist')
            .expect(200)
            .send({
                "userid": 13,
                "deckjson" : {
                    "1": 1,
                    "2" : 1
                }
            })
            .end ( function(err, res) {
                if (err)
                    done(new Error(err.message));

                console.log(res.text);
                res.status.should.equal(200);

                // response should equal json string, weird commat formatting
                res.text.should.equal('\{\"success\":true,\"fair_match\":true\}');
                done();
            })
    })

    it('Deck played is not in submitted decklists with expected input test', function(done) {

        server.post('/api/validate_decklist')
            .expect(200)
            .send({
                "userid": 13,
                "deckjson" : {
                    "1": 1,
                    "2" : 1000
                }
            })
            .end ( function(err, res) {
                if (err)
                    done(new Error(err.message));

                console.log(res.text);
                res.status.should.equal(200);

                // response should equal json string, weird commat formatting
                res.text.should.equal('\{\"success\":true,\"fair_match\":false\}');
                done();
            })
    })

});