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



describe('Test updating match result functionality', function()
{
    it('Test update_match_result for single row', function(done)
    {
        db.get().query('INSERT INTO matches (matchid, homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid) VALUES(66, 13, 31, 13, 1, 1)', function (err, result) {
            db_api.update_match_result(66, 31, function (err, rows) {
                if (err) {
                    done(new Error('Error updating match results api'));
                }
                else {
                    if (rows.affectedRows === 1) {
                        done();
                    }
                    else {
                        done(new Error('Expected rows affected: 1' + '\n Returned rows affected: ' + rows.affectedRows));
                    }

                }

            });
        })

    })
});