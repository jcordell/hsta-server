var db = require('../db.js');

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
/*delete this
* exports.get_user_decklists = function(userId, done) {
    db.get().query("SELECT deckname, deckcode FROM ownedBy WHERE userid = ?", [userId], function (err, rows) {
        if (err) {
            console.log('error in query');
            console.log(err.message);
            return done(err);
        }
        done(null, rows)
    })

    matches : {
player1: userid,
player2: userid,
status: winner userid/unplayed,
date: date
}
};*/
exports.get_tournaments = function(userid, done){
    db.get().query("SELECT name, tournamentid FROM tournament WHERE userid = ?", [userid], function(err, rows){
        if (err) {
            console.log('error in query');
            console.log(err.message);
            return done(err);
        }
        var tInfo = '{"tournaments":[{}]}';

        for (var i = 0; i < rows.length; i++) {
            db.get().query("SELECT * FROM matches WHERE tournamentId = ?", rows[i][0], function(err2, matchRows){
                if (err2){
                    console.log('error in getting matches');
                    console.log(err2.message);
                    return done(err)
                }
                for(var x = 0; x < matchRows.length; x++) {
                    var obj = JSON.parse(jsonStr);
                    obj['tournaments'].push({
                        "tournamentname": rows[i][0],
                        "matches": {
                            "matchid":matchRows[x][0],
                            "player1":matchRows[x][1],
                            "player2":matchRows[x][2],
                            "winner":matchRows[x][3],
                            "isValid":matchRows[x][4]
                        }
                    });
                    tInfo = JSON.stringify(obj);
                }
            })
        }
        done(null, tInfo);
    })
}

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


exports.get_match= function(matchid, userid, done)
{
    //TODO: return decks (of opponent or both)
    //TODO: return opponentid, deckname, deckcodes
    var my_id= userid;

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
             //     console.log(match_info);
             //     console.log(deck_info);
             //     console.log(opp_id);

                  //console.log(match_info[0]);
                  var final= [match_info[0].matchid, match_info[0].homeTeamId, match_info[0].awayTeamId,
                      match_info[0].winningTeamId, match_info[0].tournamentid, match_info[0].isValid,
                      deck_info[0].deckname, deck_info[0].deckcode, opp_id];

                  done(null, final);

              }
          });








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

