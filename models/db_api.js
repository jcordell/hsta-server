var db = require('../db.js');
var async = require('async');
//var await = require('await');

exports.create_user = function(battletag, done) {
  var values = [battletag];
  db.get().query('INSERT INTO user (battletag) VALUES(?)', values, function(err, result) {
      if (err) {
          console.log(err.message);
          return done(err);
      }
      done(null, result.insertId)
  })
};

exports.get_user_decklists = function(userId, done) {
    db.get().query("SELECT deckname, deckcode FROM ownedBy WHERE userid = ?", [userId], function (err, rows) {
        if (err) {
            console.log('error in query');
            console.log(err.message);
            return done(err);
        }
        done(null, rows)
    })
};

exports.add_deck = function(userid, deckcode, deckname, done) {
    var values = [userid, deckcode, deckname];
    db.get().query('INSERT INTO ownedBy (userid, deckcode, deckname) VALUES(?,?,?)', values, function(err, result) {
        if (err) {
            console.log(err.message);
            return done(err);
        }
        done(null, result.insertId)
    })
};

exports.delete_deck = function(userid, deckcode, done){

    var values= [userid, deckcode];
    db.get().query('DELETE FROM ownedBy WHERE userid = ? AND deckcode = ?', [userid, deckcode], function(err, result){
      if(err){
          return done(err);
      }
      done(null, result);
    })
};

exports.update_decklist_name = function(userid, deckcode, deckname, done) {
    var values = [deckname, userid, deckcode];
    db.get().query('UPDATE ownedBy ' +
        'SET deckname = ? ' +
        'WHERE userid = ? AND deckcode = ?', [deckname, userid, deckcode], function(err, result){
        if(err) {
            console.log(err.message);
            return done(err);
        }
        done(null, result);
    })
};

exports.validate_decklist = function(userid, deckcode, done) {
    var values = [userid, deckcode];
    db.get().query('SELECT deckcode FROM ownedBy ' +
        'WHERE userid = ? AND deckcode = ?', values, function(err, results) {
        if(err) {
            console.log(err.message);
            return done(err);
        }
        done(null, results);
    })
};

exports.login = function(battletag, done) {
    var values = [battletag];
    db.get().query('SELECT userid FROM user WHERE battletag = ?', values, function(err, results) {
        if(err) {
            console.log(err.message);
            return done(error);
        } else if (results[0] == null) {
            return done(null, null);
        } else {
            done(null, results[0].userid);
        }
    })
};

exports.create_tournament = function(name, numDecks, userid, done) {
    var values = [name, numDecks, userid];
    db.get().query('INSERT INTO tournament (name, numDecks, userid) VALUES(?,?,?)', values, function(err, result) {
        if (err) {
            console.log(err.message);
            return done(err);
        }
        done(null, result.insertId)
    })
};

exports.delete_tournament = function(tournamentid, done){
    var values= [tournamentid];
    db.get().query('DELETE FROM tournament WHERE tournamentid = ?', values, function(err, result){
        if(err){
            return done(err);
        }
        done(null, result);
    })
};

var get_num_tournament_decks = function(tournamentid, done) {
    db.get().query('SELECT numDecks FROM tournament WHERE tournamentid = ?', tournamentid, function(err, numDecks) {
        if (err) {
            console.log(err.message);
            return done(err);
        }
        return done(null, numDecks);
    })
}


exports.get_tournaments = function(userid, done){
    db.get().query("SELECT name, tournamentid FROM tournament WHERE userid = ?", [userid], function(err, rows){
        if (err) {
            console.log('error in query');
            console.log(err.message);
            return done(err);
        }

       var thing = process(rows, function(err, something)
       {
           if (err) {
               console.log(err.message);
               return done(err);
           }
           else return done(null, something);
       });
        function process(rows, cb) {
            var tInfo = '{"tournaments":[]}';
            async.forEach(rows, function (rows, callback) {
                db.get().query("SELECT * FROM matches WHERE tournamentId = ?",
                    [rows.tournamentid], function (err2, matchRows)
                {
                        if (err2) {
                            console.log('error in getting matches');
                            console.log(err2.message);
                            return done(err)
                        }
                    for (let match of matchRows)
                    {
                        var obj = JSON.parse(tInfo);

                        obj['tournaments'].push({
                            "tournamentname": rows.name,
                            "matches": {
                                "matchid": match.matchid,
                                "player1": match.homeTeamId,
                                "player2": match.awayTeamId,
                                "winner": match.winningTeamId,
                                "isValid": match.isValid
                            }
                        });

                        tInfo = JSON.stringify(obj);
                    }
                        callback(null, matchRows);
                    });
            },function(){
                    cb(null,tInfo);
                });
        }
    })
};

var populate_tournament_deck_array = function(userid, tournamentid, deckcode, done) {
    new_table = [];
    var promises = deckcode.map(function(deck) {
        new_table.push([deck, userid, tournamentid, 0])
    });

    Promise.all(promises).then(done(new_table));
}
/*router.get('/ban_tournament_deck', function(req, res){
    var userid = req.query.userid;
    var tournamentid = req.query.tournamentid;
    var deckcode = req.query.deckcode;
    db_api.ban_tournament_deck(userid, tournamentid, deckcode, function(err, status){
        if(err){
            console.log("error db_api banning deck");
            console.log(JSON.stringify(status));
            res.send(JSON.stringify({success: false, error: err.message}));
        }
        else {
            console.log(JSON.stringify(status));
            res.send(JSON.stringify({success: true}));
        }
    })

     db.get().query('UPDATE ownedBy ' +
        'SET deckname = ? ' +
        'WHERE userid = ? AND deckcode = ?', [deckname, userid, deckcode], function(err, result){


});*/
exports.ban_tournament_deck = function(userid, tournamentid, deckcode, done){
    db.get().query('UPDATE decksInTournament SET banned = ? WHERE userid = ? AND deckcode = ?',
        [1, userid, deckcode], function(err, result){
        if(err){
            console.log("error banning deck");
            console.log(err.message);
            return done(err);
        }
        else {
            done(null, result);
        }

        })
}

exports.add_tournament_deck = function(userid, tournamentid, deckcode, done) {

    db.get().query('DELETE FROM decksInTournament WHERE userid = ? AND tournamentid = ?', [userid, tournamentid], function(err){
        if (err){
            console.log("Error deleting decks from tournament");
            console.log(err.message);
            return done(err);
        } else {

            populate_tournament_deck_array(userid, tournamentid, deckcode, function(new_table) {
                db.get().query('INSERT INTO decksInTournament (deckcode, userid, tournamentid, banned) VALUES ?', [new_table], function(err, result){
                    if (err){
                        console.log("error inserting into decksInTournament");
                        console.log(err.message);
                        return done(err);
                    }
                    else {
                        done(null, result);
                    }
                })
            })
        }
    });


};

exports.join_tournament = function(userid, tournamentid, done) {
    var values = [userid, tournamentid];
    db.get().query('INSERT INTO playsInTournament (userid, tournamentid) VALUES (?,?)', values, function(err, result) {
        if (err) {
            console.log(err.message);
            return done(err);
        }

        // find how many decks are allowed in tournament
        numDecks = get_num_tournament_decks(tournamentid, function(err, numDecks) {
            done(null, numDecks[0].numDecks);
        });
    })
};

exports.create_match= function(homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid, done)
{
    var values= [homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid];

    db.get().query('INSERT INTO matches (homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid) VALUES (?,?,?,?,?)', values, function(err, result)
    {
        if(err)
        {
            return done(err);
        }

        console.log(JSON.stringify(result));
        done(null, result.insertId)
    })
};


exports.delete_match = function(matchid, done)
{
    db.get().query('DELETE FROM matches WHERE matchid = ?', matchid, function(err, result)
    {
        if(err)
        {
            console.log(err.message);
            return done(err);
        }
        done(null, result);
    })
};


exports.get_match= function(matchid, done)
{
    //TODO: figure out what needs to be returned, add isValid to 'where' clause?
    db.get().query('SELECT * FROM matches WHERE matchid = ?', matchid, function(err, result)
    {
      if(err)
      {
          console.log(err.message);
          return done(err);
      }
      done(null, result);
    })

};

/*
* get().query('UPDATE ownedBy ' +
        'SET deckname = ? ' +
        'WHERE userid = ? AND deckcode = ?', [deckname, userid, deckcode], function(err, result){*/

exports.update_match_result = function(matchid, winnerid, done){
    db.get().query('UPDATE matches SET winningTeamId = ? ' +
        'WHERE matchid = ?', [winnerid, matchid], function(err, result){
        if (err){
            console.log(err.message);
            return done(err);
        }
        done(null, result);
    })
}

