
var db_api = require('../models/db_api');
var db = require('../db.js');
var async = require('async');

// Connect to test database
db.connect(db.MODE_TEST, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1)
    } else {
        console.log('connected to test database');
    }
});



get_tournaments = function(userid, done){
    db.get().query("SELECT name, tournamentid FROM tournament WHERE userid = ?", [userid], function(err, rows){
        if (err) {
            console.log('error in query');
            console.log(err.message);
            return done(err);
        }
        if (rows.length === 0)
        {
            console.log("User is not in a tournament");
            err = "User is not in a tournament";
            return done(err);
        }
        console.log(rows);

        var thing = process(rows, function(err, something)
        {
            if (err) {
                console.log(err.message);
                return done(err);
            }
            else return done(null, something);
        });
        function process(rows, cb) {
            var counter;
            var index = 0;
            var tInfo = '{"tournaments":[]}';
            async.forEachLimit(rows, 1, function (rows, callback)
            {
                function counting()
                {
                    return new Promise(
                        function(countingdone) {

                                function setZero() {
                                    return new Promise(
                                        function (zerodone) {
                                            if (counter === undefined) {
                                                counter = 0;
                                                zerodone();
                                            }
                                            else
                                                zerodone();
                                        })
                                }

                                setZero()
                                    .then(() => {

                                        function queryMatches()
                                        {
                                            return new Promise(
                                                function (querydone)
                                                {
                                                    db.get().query("SELECT * FROM matches WHERE tournamentId = ?",
                                                        [rows.tournamentid], function (err2, matchRows) {
                                                            if (err2) {
                                                                console.log('error in getting matches');
                                                                console.log(err2.message);
                                                                return done(err)
                                                            }

                                                            for (let match of matchRows) {
                                                                function getMatches() {
                                                                    return new Promise(
                                                                        function (matchdone) {
                                                                            if (counter === 0 && index === 0) {
                                                                                console.log("counter is 0 - promise")
                                                                                var obj = JSON.parse(tInfo);

                                                                                obj['tournaments'].push({
                                                                                    "tournamentname": rows.name,

                                                                                    "matches": []

                                                                                });

                                                                                tInfo = JSON.stringify(obj);
                                                                                index = 1;
                                                                                matchdone();
                                                                            }
                                                                            else
                                                                                matchdone();
                                                                        }
                                                                    )
                                                                }

                                                                getMatches()
                                                                    .then(() => {
                                                                        var obj = JSON.parse(tInfo);
                                                                        console.log("TOURNAMENTS");
                                                                        console.log(obj);
                                                                        console.log(counter);


                                                                        obj['tournaments'][counter].matches.push({
                                                                            "matchid": match.matchid,
                                                                            "player1": match.homeTeamId,
                                                                            "player2": match.awayTeamId,
                                                                            "winner": match.winningTeamId,
                                                                            "isValid": match.isValid
                                                                        });
                                                                        //console.log(obj['tournaments'][counter].matches);

                                                                        tInfo = JSON.stringify(obj);


                                                                    })
                                                                    .catch(() => {
                                                                        console.log("catch error");
                                                                        console.log(err);
                                                                    })


                                                            }

                                                            callback(null, matchRows);
                                                        });
                                                    querydone();
                                                }
                                            )
                                        }
                                        queryMatches()
                                            .then(() =>{
                                                console.log(counter);
                                            })
                                    })
                                    .then(()=> {
                                        countingdone();
                                    })

                        }
                    )
                }
                counting()
                    .then(() => {
                        counter++;
                    })
            },function(){
                cb(null,tInfo);
            });
        }
    })
};

get_tournaments(6, function(err, result) {
    if (err)
        console.log(err);
    else
    {
        console.log("RESULT")
    console.log(result);
    }
});