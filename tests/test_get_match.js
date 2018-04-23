var supertest = require('supertest');
var should = require('should');
var server = supertest.agent("http://localhost:3000");

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

var delId=0;


describe('Test get_match() functionality', function()
{
    it('Test get_match() for single match', function(done)
    {
        var values = ['dc1', 12, 1, 0];
        var tid=0;

        //Problem formatting date?
        db_api.get_match(123, 4, function (err3, data) {
            if (err3) {
                console.log(JSON.stringify(data));
                done(new Error('Error getting match...\n' + err3));
            }
            else {
                console.log("FINAL DATA BELOW: ");
                console.log(data);

                if ((data.matchId === 123) && (data.homeTeamId === 4) && (data.awayTeamId === 6)
                    && (data.winningTeamId === 10) && (data.isValid === 1) && (data.oppId === 6)) {
                    done();
                }
                else {
                    done(new Error('get_matches failure, wrong return value'));
                }
            }

        });

    });
});