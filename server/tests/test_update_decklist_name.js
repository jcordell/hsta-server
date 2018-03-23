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
        db_api.update_decklist_name(1, 'dc1', 'test2', function (err, rows)
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