var express = require('express');
var router = express.Router();
var app= require('../app');
var db_api = require('../models/db_api');

/* GET user decklists. */
router.get('/get_user_decklists', function(req, res) {
  res.send('respond with a get_user_decklist');
});

/* GET users listing. */
router.get('/add_deck', function(req, res) {
  var userid = req.query.userid;
  var deckcode = req.query.deckcode;
  var deckname = req.query.deckname;
  console.log(userid + " " + deckcode);

  db_api.add_deck(userid, deckcode, deckname, function(err, insertId) {
      if (err) {
          console.log('Unable to add deck');
      } else {
          res.send(insertId);
      }
  });

  res.send('respond with an add deck' + req.param('deck_string'));
});

/* GET users listing. */
router.get('/delete_deck', function(req, res) {
    var userid= req.query.userid;
    var deckcode= req.query.deckcode;
    db_api.delete_deck(userid, deckcode, function(err, deleteDeck){
        if(err){
            console.log('Delete deck failed');
        } else{
            console.log(deleteDeck);
        }
    });
    res.send('delete deck');
});

/* GET users listing. */
router.get('/validate_decklist', function(req, res) {
  res.send('respond with a validate_decklist');
});

/* GET users listing. */
router.get('/update_decklist_name', function(req, res) {
    var userid = req.query.userid;
    var deckname = req.query.deckname;
    var deckcode = req.query.deckcode;

    db_api.update_decklist_name(userid, deckcode, deckname,function(err, response){
        if(err){
            console.log('Update deckname failed');
        } else{
            res.send(response);
        }
    });
});

/* create new user */
router.get('/create_user', function(req, res) {
    var email = req.query.email;
    db_api.create_user(email, function(err, insertId) {
        if (err) {
            console.log('Unable to create user');
            // process.exit(1)
        } else {
            console.log(insertId);
        }
    });
});
module.exports = router;
