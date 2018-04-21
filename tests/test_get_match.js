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

//function dateString2Date(dateString) {
//    var dateTime  = dateString.split(/\-|\s/);
 //   return new Date(dateTime.slice(0,3).reverse().join('-') + ' ' + dateTime[3]);
//}

describe('Test get_match() functionality', function()
{
    /*
    it('Test get_match() for single match', function(done)
    {

        db_api.create_match(12, 34, 12, 1, 1, function(err, result)
        {
            if(err)
            {
                console.log("Error creating match");
                done(err.message);
            }
            db_api.get_match(result, 34, function(err, data)
            {
                if(err)
                {
                    console.log(JSON.stringify(data));
                    done(err.message);
                }
                else {
                    if((data[0] === result) && (data[1] === 12) &&
                        (data[2] === 34) && (data[3] === 12) && (data[4] === 1)
                        && (data[5] === 1) && (data[8] == 12))
                    {
                        console.log(JSON.stringify(data)); //DEBUG
                        done();

                    }
                }

            });

        });

    }) */
    it('Test get_match() for single match', function(done)
    {
        //Problem formatting date? --> e.g date = 2018-04-21T00:30:53.000Z --> get rid of T and Z
        var date= new Date().toISOString().slice(0, 19).replace('T', ' ');

        db_api.create_match(12, 34, 12, 1, 1, date, function(err, result)
        {
            if(err)
            {
                console.log("Error creating match");
                done(err.message);
            }
            db_api.get_match(result, 34, function(err, data)
            {
                if(err)
                {
                    console.log(JSON.stringify(data));
                    done(err.message);
                }
                else {
                    if((data[0] === result) && (data[1] === 12) &&
                        (data[2] === 34) && (data[3] === 12) && (data[4] === 1)
                        && (data[5] === 1) && (data[9] === 12))
                    {
                        console.log(JSON.stringify(data)); //DEBUG
                        done();
                    }
                }

            });

        });

    })

});
