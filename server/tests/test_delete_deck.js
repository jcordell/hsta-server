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

function genId(num)
{
    return num;
}

function genDc(num)
{
    return 'dc'+1;
}
function genDn(num)
{
    return 'deck'+num;
}

//clear table at beginning
// remove entry from database to prevent duplicate key


describe('Basic Delete Deck functionality', function()
{
    it('Test delete_deck for single input', function(done) {
                // add a single entry into the database to be deleted
               // var addValues = ['fakeemailtest', 'dc1', 'test1'];


                // separate variables in order to print detailed error message
                var userid = 1;
                var deckcode = 'dc1';

                //run delete deck api on deck
                db_api.delete_deck(11, 'dc1', function (err, delStat) {
                    if (err) {
                        done(new Error(err.message));
                    }
                    else {
                        if (delStat.affectedRows === 1) {
                            done();
                        }
                        else {
                            done(new Error('num rows affected: ' + delStat.affectedRows));
                        }
                    }
                })
    });



    it('Test delete_deck for multiple input', function(done)
    {
        var userid= [];
        var deckcode= [];
        var dn= [];
        var i;
        var addValues= [];
        var sql;

        //set up 10 entries in table
        for(i = 0; i < 10; i ++) {

            userid[i] = genId(i + 1);
            deckcode[i] = genDc(i);
            dn[i] = genDn(i);
            addValues = [userid[i], deckcode[i], dn[i]];
        }

            //set up loop to delete first 10 rows
            db_api.delete_deck(userid[1], deckcode[1], function (err, dstat) {
                if (err) {
                    console.log(dstat);
                    done(new Error('Error when deleting row '));
                }
                else {
                    if (dstat.affectedRows === 1) {
                        done();
                    }
                    else {
                        done(new Error(dstat));
                        // done(new Error('Expected: 1' + '\nGot: dstat.rowsAffected'));
                    }

                }
            });

    })

});// end describe