var express = require('express');
var router = express.Router();
var app= require('../app');
var db_api = require('../models/db_api');

/* GET user decklists.
* Input: params: userid
* Return: array of decklists. Example: [["deckname1", deckcode1],["deckname2", deckcode2"]]*/
router.get('/get_user_decklists', function(req, res) {
    var userid = req.query.userid;
    db_api.get_user_decklists(userid, function(err, data){
        if (err) {
            console.log(err.message);
            console.log('Unable to get decklists');
        } else {
            // reformat deck info to an array
            var deck_info = [];
            for (var i = 0; i < data.length; i++)
                deck_info.push([data[i].deckname, data[i].deckcode]);
            res.send(deck_info);
        }
    });
});

/* input: params: userid, deckcode, deckname (Josh test)
 * return: { 'success' : true/false, 'error' : none/error_code/error_message } */
router.get('/add_deck', function(req, res) {
  var userid = req.query.userid;
  var deckcode = req.query.deckcode;
  var deckname = req.query.deckname;
  console.log(userid + " " + deckcode);

  db_api.add_deck(userid, deckcode, deckname, function(err, insertId) {
      if (err) {
          console.log('Unable to add deck');
          res.send(JSON.stringify({ success: false, error: err.message }))
      } else {
          res.send(JSON.stringify({ success: true }));
      }
  });
});

/* input: params: userid, deckcode
* return: { 'success' : true/false, 'error' : none/error_code }*/
router.get('/delete_deck', function(req, res) {
    var userid= req.query.userid;
    var deckcode= req.query.deckcode;

    db_api.delete_deck(userid, deckcode, function(err, deleteDeck){
        if(err){
            console.log(err.message);
            console.log('Delete deck failed');
        } else{
            console.log(deleteDeck);
        }
    });
    res.send('delete deck');
});

/* Checks if user has submitted a deckcode, returns boolean
 * input: params: userid, deckcode
 * return: { 'hasDeck' : true/false, 'error' : none/error_code }*/
router.get('/validate_decklist', function(req, res) {
  var deckcode = req.query.deckcode;
  var userid = req.query.userid;

  // get user saved decklists from db
  db_api.validate_decklist(userid, deckcode, function(err, response) {
      // error retrieving from db
      if(err) {
          console.log("unable to validate decklist");
      } else {
          /*
            response is list of deckcodes from user
            if a result, the user has a submitted deck with same deckcode, return true
           */
          if(response.length == 1) {
              res.send(JSON.stringify({hasDeck : true}));
          }
          else {
              res.send(JSON.stringify({hasDeck : false, error : null}));
          }
      }
  })
});

/* GET users listing.
 * input: params: userid, deckname, deckcode
  * return: { 'success' : true/false, 'error' : none/error_code }*/
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

/* create new user
 * input: param: email
  * return: { 'success' : true/false, 'error' : none/error_code }*/
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
