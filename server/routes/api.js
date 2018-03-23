var express = require('express');
var router = express.Router();
var app= require('../app');
var db_api = require('../models/db_api');
var deckstrings = require('deckstrings');

decode = function(deckcode) {
    try {
        return deckstrings.decode(deckcode);
    } catch (e) {
        return null
    }
}

/* GET user decklists.
* Input: params: userid
* Return: array of decklists. Example: [["deckname1", deckcode1],["deckname2", deckcode2"]]*/
router.get('/get_user_decklists', function(req, res) {
    var userid = req.query.userid;
    db_api.get_user_decklists(userid, function(err, data){
        if (err) {
            console.log(err.message);
            res.send(JSON.stringify({success : false, mesage : err.message}));
        } else {
            // reformat deck info to an array
            var deck_info = [];
            var deck_names = [];
            for (var i = 0; i < data.length; i++) {
                // get decoded deckcode data
                deckcode = data[i].deckcode;
                decoded_deckstring = decode(deckcode);

                // if unable to decode or invalid deckstring
                if (decoded_deckstring == null) {
                    decoded_deckstring = {};
                }

                decoded_deckstring['deckname'] = data[i].deckname;
                decoded_deckstring['deckcode'] = data[i].deckcode;
                deck_info.push([decoded_deckstring]);
                deck_names.push([data[i].deckname]);
            }
            res.send(JSON.stringify({success : true, decks: deck_info, deck_names : deck_names}));
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

/*
Stub for logging in a user
Takes in an email and returns userid
If email not in database, returns info about that
 */
router.get('/login', function(req, res) {
   var email = req.query.email;
   db_api.login(email, function(err, userid) {

       // user not created
       if(userid == null) {
            res.send(JSON.stringify({success : false, message : 'Email not yet registered'}));
        } else {
            res.send(JSON.stringify({success : true, id : userid}));
        }
   })
});

/* create new user
 * input: param: email
  * return: { 'success' : true/false, 'error' : none/error_code }*/
router.get('/create_user', function(req, res) {
    var email = req.query.email;
    db_api.create_user(email, function(err, userid) {

        // likely user already registered
        if(err) {
            console.log(err.message);
            res.send(JSON.stringify({success : false, error: err.message}));

        }
        else {
            res.send(JSON.stringify({success : true, id : userid}));
        }
    });
});
module.exports = router;
