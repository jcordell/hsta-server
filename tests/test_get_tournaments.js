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

describe('Test get_tournaments() functionality', function() {
    it('Test get_tournaments() for a user with one tournament', function(done)
    {

        /*server.get('/api/get_tournaments?userid=6')
            .expect(200)
            .end(function (err, res) {
                if (err)
                    done(new Error(err.message));

                console.log("testing");
                res.status.should.equal(200);

                // response should equal json string, weird commat formatting
                res.text.should.equal('\{\"success\":true}');
                done();
            })
        });
                /*db_api.get_tournaments(6, function(err, result) {

                console.log("testing2");
        });*/
                db_api.get_tournaments(6, function(err, result) {
                    if (err){
                        console.log("Error getting tournaments");
                        console.log(err);
                        done(new Error(err.message));
                    }
                    console.log(result);
                    var obj = JSON.parse(result);
                    console.log("debugging");
                    console.log(obj);
                    console.log(obj.tournaments[0].matches);
                    obj.tournaments[0].tournamentname.should.equal('tournament_0');
                    obj.tournaments[0].matches.matchid.should.equal(1);
                    done();
                });

    });
    it ('Test get_tournaments() for a user with no tournaments', function(done)
    {
        db_api.get_tournaments(1010, function(err, result){
            if (err){
                console.log("Error getting tournaments");
                err.should.equal("User is not in a tournament");
                done();

            }
        })
    })

});