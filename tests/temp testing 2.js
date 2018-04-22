
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



get_tournaments = function(userid, done) {
    db.get().query("SELECT name, tournamentid FROM tournament WHERE userid = ?", [userid], function (err, rows) {
        if (err) {
            console.log('error in query');
            console.log(err.message);
            return done(err);
        }
        if (rows.length === 0) {
            console.log("User is not in a tournament");
            err = "User is not in a tournament";
            return done(err);
        }

        process(rows)
            .then(resolve => {
                console.log("PROCESS TINFO PROCESS TINFO");
                console.log(resolve);
                return done(null, resolve);
            })
            .catch(error => {
                console.log(error);
                console.log("error after process promise");
            });

        function process(tournamentRows) {
            return new Promise
            (
                function(resolve, reject) {
                    var tInfo = '{"tournaments":[]}';
                    var totalRows = 0;
                    for (let row of tournamentRows)
                    {
                        var counter = 0;
                       function query(sql, args)
                       {
                                return new Promise((resolve, reject) =>
                                {
                                    db.get().query(sql, args, (err, matchRows) => {
                                        if (err)
                                            return reject(err);
                                        resolve(matchRows);
                                    });
                                })
                            }
                            query("SELECT * FROM matches WHERE tournamentId = ?", row.tournamentid)
                                .then((matchRows) =>
                                {

                                        var obj = JSON.parse(tInfo);

                                        obj['tournaments'].push({
                                            "tournamentname": row.name,
                                            "matches": []
                                        });
                                        tInfo = JSON.stringify(obj);

                                    for (let match of matchRows) {
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


                                        tInfo = JSON.stringify(obj);

                                    }
                                    counter++;
                                    totalRows++;
                                    if (totalRows === tournamentRows.length)
                                        resolve(tInfo);
                                })
                                .catch((err) =>{
                                    console.log("error getting match rows");
                                    console.log(err);
                                });

                    }

                    resolve(tInfo);
                }
            )
        }
    })
}



get_tournaments(6, function(err, result)
{
    if (err) {
        console.log("ERROR ERROR ERROR")
        console.log(err);
    }
    else
    {
        console.log("RESULT");
        obj = JSON.stringify(result);
        console.log(result);
        console.log(obj);
    }
});