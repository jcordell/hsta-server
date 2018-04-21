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

exports.get_user_tournament_decklists = function(userId, tournamentId, done) {

    // get the deckcode and deckname of tournaments in deck
    db.get().query("SELECT deckname, deckcode FROM ownedBy WHERE deckcode IN " +
                        "(SELECT deckcode FROM decksInTournament WHERE userid = ? AND tournamentid = ?)",
                        [userId, tournamentId], function (err, rows) {
        if (err) {
            console.log('error in query');
            console.log(err.message);
            return done(err);
        }
        done(null, rows)
    })
};

exports.get_user_tournament_matches_count = function(userId, tournamentId, done) {
    db.get().query("SELECT COUNT(*) FROM matches WHERE tournamentid = ? AND (homeTeamId = ? OR awayTeamId = ?)",
            [tournamentId, userId, userId], function(err, count) {
        if(err) {
            console.log(err.message);
            return done(err);
        }
        done(null, count);
        })
}

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
};

exports.ban_tournament_deck = function(userid, tournamentid, deckcode, done){
    db.get().query('UPDATE decksInTournament SET banned = ? WHERE tournamentid = ? AND userid = ? AND deckcode = ?',
        [1, tournamentid, userid, deckcode], function(err, result){
        if(err){
            console.log("error banning deck");
            console.log(err.message);
            return done(err);
        }
        else {
            done(null, result);
        }

        })
};

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
    // remove from playsInTournament if already exists
    db.get().query('DELETE FROM playsInTournament WHERE userid = ? AND tournamentid = ?', values, function(err, result) {
        if(err) {
            console.log('Error in deleting from playsInTournament');
            done(err);
        }
        db.get().query('INSERT INTO playsInTournament (userid, tournamentid) VALUES (?,?)', values, function(err, result) {
            if (err) {
                console.log('error in inserting into playsInTournament');
                console.log(err.message);
                return done(err);
            }

            // find how many decks are allowed in tournament
            numDecks = get_num_tournament_decks(tournamentid, function(err, numDecks) {
                done(null, numDecks[0].numDecks);
            });
        })
    })

};

exports.create_match= function(homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid, matchDate, done)
{
    var values= [homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid, matchDate];

    db.get().query('INSERT INTO matches (homeTeamId, awayTeamId, winningTeamId, tournamentid, isValid, matchDate) VALUES (?,?,?,?,?,?)', values, function(err, result)
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


exports.get_match= function(matchid, userid, done)
{
    //TODO: return decks (of opponent or both)
    //TODO: return opponentid, deckname, deckcodes
    var my_id= userid;
/*
    db.get().query('SELECT * FROM matches WHERE matchid = ?', matchid, function(err, match_info)
    {
      if(err)
      {
          console.log(err.message);
          return done(err);
      }
      else
      {

          //console.log(result[0].homeTeamId);
          var opp_id;
          if(my_id === match_info[0].homeTeamId)
          {
              opp_id = match_info[0].awayTeamId;
          }
          else if(my_id === match_info[0].awayTeamId)
          {
              opp_id= match_info[0].homeTeamId;
          }
          else
          {
              console.log('user is not a part of this match: return nothing');
              done(null, 'invalid match request');
          }


          db.get().query('SELECT deckname, deckcode FROM ownedBy WHERE userid = ?', opp_id, function(err, deck_info)
          {
              if(err)
              {
                  console.log(err.message);
                  return done(err);
              }
              else
              {
                  console.log(match_info);
                  console.log(deck_info);
                  console.log(opp_id);

                  //console.log(match_info[0]);
                  var final= [match_info[0].matchid, match_info[0].homeTeamId, match_info[0].awayTeamId,
                      match_info[0].winningTeamId, match_info[0].tournamentid, match_info[0].isValid,
                      match_info[0].matchDate, deck_info[0].deckname, deck_info[0].deckcode, opp_id];

                  done(null, final);

              }
          });

      }
    })
*/

db.get().query('SELECT * FROM matches WHERE matchid = ?', matchid, function(err, match_info)
{
    if(err)
    {
        console.log(err.message);
        done(err);
    }
    else
    {
        //DEBUG
        console.log(JSON.stringify('tournamentid: ' + match_info[0].tournamentid));
       // done(null, match_info);
        var tid = match_info[0].tournamentid;

/*
        var opp_id;
        if(my_id === match_info[0].homeTeamId)
        {
            opp_id = match_info[0].awayTeamId;
        }
        else if(my_id === match_info[0].awayTeamId)
        {
            opp_id= match_info[0].homeTeamId;
        }
        else
        {
            console.log('user is not a part of this match: return nothing');
           // done(null, 'invalid match request');
        }
*/
        //CHANGE 4 TO opp_id
        var args= [tid, 4];

        console.log("arg1:" +args[0] + "arg2:"+ args[1]);
        db.get().query("SELECT deckcode FROM decksInTournament WHERE userid = ? AND tournamentid = ?", [4, tid], function (err, deck_info)
            {
                if (err) {
                    console.log('error in query');
                    console.log(err.message);
                    return done(err);
                }
                console.log(JSON.stringify("deckinfo: " + deck_info[0].deckcode));
                done(null, deck_info)
            })
        // console.log("oppid: "+ opp_id);
       /* db.get().query('SELECT * FROM decksInTournament', function(err, deck_info)
        {
            if(err)
            {
                console.log(err.message);
                done(err);
            }
            else
            {
                console.log(JSON.stringify(deck_info));
                done(null, deck_info);
            }
        })*/


    }



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

