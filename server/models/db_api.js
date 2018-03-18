var db = require('../db.js');

exports.create_user = function(email, done) {
  var values = [email];
  db.get().query('INSERT INTO user (email) VALUES(?)', values, function(err, result) {
      if (err) return done(err);
      done(null, result.insertId)
  })
};

exports.delete_deck= function(user_id, deck_id, done){

    db.get().query('DELETE FROM ownedBy WHERE userid = ? AND deckcode = ?',user_id, deck_id , function(err, result){
      if(err) return done(err);
      done(null, result.deleteDeck);
    })


};
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