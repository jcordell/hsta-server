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

var values = ['dc1', 12, 1, 0];
var tid=0;
//create a valid decksInTournament entry in order to test
db_api.create_tournament('test_tournament_100', 3, 10, function(err, tournId)
{
    if(err)
    {
        console.log(err.message);
        return done(err);
    }
    else
    {
        console.log('TOURNAMENTID - tournId: '+ tournId);
        tid = tournId;
        var vals= ['dc1', 10, 334, 0];
        db.get().query('INSERT INTO decksInTournament (deckcode, userid, tournamentid, banned) VALUES(?,?,?,?)', vals, function(err, result)
        {
            if(err)
            {
                console.log('error when inserting into decksInTournament');
                return done(new Error(err.message));
            }
            else
            {
                console.log('insert successful!');

            }
        })
    }
});

describe('Test get_match() functionality', function()
{
    it('Test get_match() for single match', function(done)
    {

        //Problem formatting date?
        var date= new Date().toISOString().slice(0, 19).replace('T', ' ');

            console.log("tid: " + tid);
            db_api.create_match(10, 12, 10, 334, 1, date, function (err2, result) {
                if (err2) {

                    console.log("Error creating match, result:  " + result);
                    return done(new Error(err2.message));
                }
                db_api.get_match(result, 12, function (err3, data) {
                    if (err3) {
                        console.log(JSON.stringify(data));
                        return done(new Error(err3.message));
                    }
                    else {
                        console.log("FINAL DATA BELOW: ");
                        console.log(data);

                        if ((data.matchId === result) && (data.homeTeamId === 10) && (data.awayTeamId === 12)
                            && (data.winningTeamId === 10) && (data.isValid === 1) && (data.oppId === 10)
                            && (data.deckname === 'test1') && (data.deckcode === 'dc1')) {
                            done();
                        }
                        else {
                            return done(new Error('get_matches failure, wrong return value'));
                        }
                    }

                });

            });


    })
});