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



describe('Test Basic Update Decklist Name functionality', function()
{
    it('Test update_deckname for single row', function(done)
    {
     //   db.get().query('TRUNCATE TABLE ownedBy');
      var addValues= [1234, 'dc1234', 'test1'];
      var newDeckname= 'newdeckname1';
        //delete previously added deck to avoid duplicate type error
        db.get().query('DELETE FROM ownedBy WHERE userid = ' + addValues[0] +' AND deckcode = ' + addValues[2]);


        db_api.delete_deck(1234, 'dc1234');

        //add decks to the database to be updated
        db.get().query('INSERT INTO ownedBy (userid, deckcode, deckname) VALUES(?,?,?)', addValues, function(err)
        {
            if(err)
            {
                done(new Error(err.message));
            }
        });


        db_api.update_decklist_name(addValues[0], addValues[1], newDeckname, function (err, rows)
        {
            if(err)
            {
                done(new Error('Error updating decklist name api'));
            }
            else
            {
                if(rows.affectedRows === 1)
                {
                    done();
                }
                else
                {
                    done(new Error('Expected rows affected: 1' + '\n Returned rows affected: ' + rows.affectedRows));
                }

            }

        });

    })
});