var db = require('../db.js');

exports.create_user = function(email, done) {
  var values = [email];
  db.get().query('INSERT INTO user (email) VALUES(?)', values, function(err, result) {
      if (err) {
          console.log(err.message);
          return done(err);
      }
      done(null, result.insertId)
  })
};

exports.get_user_decklists = function(userId, done) {
    db.get().query("SELECT deckname, deckcode FROM ownedBy WHERE userid = ?", [userId], function (err, rows) {
        if (err) return done(err);
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

exports.delete_deck= function(userid, deckcode, done){

    var values= [userid, deckcode];
    db.get().query('DELETE FROM ownedBy WHERE userid = ? AND deckcode = ?', values, function(err, result){
      if(err){
          console.log(err.message);
          return done(err);
      }
      done(null, result.deleteDeck);
    })
};

exports.update_decklist_name = function(userid, deckcode, deckname, done) {
    var values = [deckcode, userid, deckcode];
    db.get().query('UPDATE ownedBy ' +
        'SET deckname = ? ' +
        'WHERE userid = ? AND deckcode = ?', values, function(err, result){
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
}