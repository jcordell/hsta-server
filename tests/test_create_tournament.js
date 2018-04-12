
var should = require('should');


var db_api = require('../models/db_api');
var db = require('../db.js');

// connect to app (hearthstone server)
var app = require('../app.js')('test');
var request = require('supertest')(app);

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
    it('Create tournament with expected input', function (done) {

        // remove decklist (if exists)
        db.get().query('DELETE FROM tournament WHERE name = \'test_tournament\'', function (err, result) {
            if (err) done(new Error(err.message));

            // test create tournament with expected input
            request.get('/api/create_tournament?name=test_tournament&numDecks=3&userid=6')

                .expect(200)
                .end(function (err, res) {
                    if (err)
                        done(new Error(err.message));

                    res.status.should.equal(200);

                    // response should equal json string, weird commat formatting
                    res.text.should.equal('\{\"success\":true,\"id\":3\}');
                    done();
                })
        });
    })
});