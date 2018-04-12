var db_api = require('../models/db_api');
var db = require('../db.js');
var should = require('should');



// Connect to test database
db.connect(db.MODE_TEST, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1)
    } else {
        console.log('connected to test database');
    }
});

/*db_api.create_tournament("test_get",3,6, function(err){

    if (err) {
        console.log("Error creating tournament");
        console.log(err.message);
    }
});
db_api.create_match(12, 34, 12, 1, 1, function(err) {

    if (err) {
        console.log("Error creating match");
        console.log(err.message);
    }
});*/
describe('Test get_tournaments() functionality', function() {
    it('Test get_tournaments() for a user with one tournament', function(done) {

                db_api.get_tournaments(6, function(err, result) {
                    if (err){
                        console.log("Error getting tournaments");
                        done(new Error(err.message));
                    }
                    console.log(result);
                    var obj = JSON.parse(result);
                    console.log("debugging");
                    //console.log(result.tournaments);
                    console.log(obj);
                    console.log(obj.tournaments[0].matches);
                    obj.tournaments[0].tournamentname.should.equal('test_get');
                    obj.tournaments[0].matches.matchid.should.equal(1);

                })
            done();
        });
});