var express = require('express');
var router = express.Router();
var app= require('../app');
var db_api = require('../models/db_api');

/* GET user decklists. */
router.get('/get_user_decklists', function(req, res) {
    var userid = req.query.userid;
    db_api.get_user_decklists(userid, function(err, data){
        var deckName;
        if (err) {
            console.log(err.message);
            console.log('Unable to get decklists');
        }
            else {
            //data[i].deckname will obtain the deckname for the current row of data
            console.log("decklists found: ");
            for (var i = 0; i < data.length; i++)
                if (i == 0) res.write('decklist found:' );
                deckName = data[0].deckname;

                //TODO fix decklists not being sent by res - not sure how that works
                //Commeneted res.write/send were not really working together
                //Also, res.write(deckName) wouldn't send anything at all
                console.log(deckName);
                //res.write(deckName);
            }
           // res.send('test');
    });
});

/* GET users listing. */
router.get('/add_deck', function(req, res) {
  res.send('respond with an add deck' + req.param('deck_string'));
});

/* GET users listing. */
router.get('/delete_deck', function(req, res) {
  res.send('respond with a delete_deck');
});

/* GET users listing. */
router.get('/validate_decklist', function(req, res) {
  res.send('respond with a validate_decklist');
});

/* GET users listing. */
router.get('/update_decklist_name', function(req, res) {
  res.send('respond with a update_decklist_name');
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
