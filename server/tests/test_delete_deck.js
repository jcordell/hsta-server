var supertest = require('supertest');
var should = require('should');
var server = supertest.agent("http://localhost:3000");

var db_api = require('../models/db_api');
var db = require('../db.js');

// connect to app (hearthstone server)
var app = require('../app.js')('test');

// start app on port 3000
app.listen(3000);
// Connect to test database
db.connect(db.MODE_PRODUCTION, function(err) {
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
    return 'dc'+num;
}
function genDn(num)
{
    return 'deck'+num;
}

//clear table at beginning
// remove entry from database to prevent duplicate key


describe('Basic Delete Deck functionality', function()
{
    it('Test delete_deck for single input', function(done)
    {

        /*
        //db.get().query('DELETE FROM ownedBy WHERE deckcode = ');
        db.get().query('TRUNCATE TABLE ownedBy');

        // add a single entry into the database to be deleted
        var addValues= ['fakeemailtest', 'dc1', 'test1'];


        // separate variables in order to print detailed error message
        var userid= 8;
        var deckcode= 'dc1';

        //add a deck to the database to be deleted


       db.get().query('INSERT INTO ownedBy (userid, deckcode, deckname) VALUES(?,?,?)', addValues);
       */


                //run delete deck api on recently added deck
               db_api.delete_deck(8, 'dc1', function(err, delStat)
               {
                   console.log(delStat)
                   if (err)
                   {
                       done(new Error(err.message));
                   }
                    else
                    {
                            if(delStat.affectedRows===1)
                            {
                                done();
                            }
                            else
                            {
                                done(new Error('num rows affected: '+ delStat.affectedRows));
                            }
                    }
               })
        });



    it('Test delete_deck for multiple input', function(done)
    {
        //db.get().query('DELETE FROM ownedBy WHERE deckcode = \'*\'');

        db.get().query('TRUNCATE TABLE ownedBy');

        var userid= [];
        var deckcode= [];
        var dn= [];
        var i;
        var addValues= [];
        var sql;

        //set up 10 entries in table
        for(i = 0; i < 10; i ++)
        {

            userid[i]= genId(i);
            deckcode[i]= genDc(i);
            dn[i]= genDn(i);

            addValues=[userid[i], deckcode[i], dn[i]];

            //sql = 'INSERT INTO ownedBy (userid, deckcode, deckname) VALUES(?,?,?)';
            db.get().query('INSERT INTO ownedBy (userid, deckcode, deckname) VALUES(?,?,?)', addValues, function(err, res)
            {
                if(err)
               {
                   done(new Error(err.message));
               }
            })


        }
        //set up loop to delete first 10 rows
        db_api.delete_deck(userid[2], deckcode[2], function(err, dstat)
        {
            if(err)
            {
                done(new Error('Error when deleting row '));
            }
            else
            {
                if(dstat.affectedRows===1)
                {
                    done();
                }
                else
                {
                    done(new Error(JSON.stringify(dstat.text)));
                   // done(new Error('Expected: 1' + '\nGot: dstat.rowsAffected'));
                }

            }
        });

    })

});// end describe