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
    console.log('here');
    console.log(deckcode.toString());
    var values = [userid, deckcode];
    db.get().query('SELECT deckcode FROM ownedBy ' +
        'WHERE userid = ? AND deckcode = ?', values, function(err, results) {
        if(err) {
            console.log(err.message);
            return done(err);
        }
        console.log('here2');
        console.log(results);
        done(null, results);
    })
}
/*
exports.create = function(userId, text, done) {
    var values = [userId, text, new Date().toISOString()];

    db.get().query('INSERT INTO comments (user_id, text, date) VALUES(?, ?, ?)', values, function(err, result) {
        if (err) return done(err);
        done(null, result.insertId)
    })
};

exports.getAll = function(done) {
    db.get().query('SELECT * FROM comments', function (err, rows) {
        if (err) return done(err);
        done(null, rows)
    })
};

exports.getAllByUser = function(userId, done) {
    db.get().query('SELECT * FROM comments WHERE user_id = ?', userId, function (err, rows) {
        if (err) return done(err);
        done(null, rows)
    })
};
*/