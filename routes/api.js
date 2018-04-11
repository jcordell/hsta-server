var express = require('express');
var router = express.Router();
var app= require('../app');
var db_api = require('../models/db_api');
var deckstrings = require('deckstrings');

var Promise = require('es6-promise');

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
            var decoded_deckstring = [];
            var deckcodes = [];
            for (var i = 0; i < data.length; i++) {
                // get decoded deckcode data
                deckcodes[i] = data[i].deckcode;

                decoded_deckstring = decode(deckcodes[i]);

                // if unable to decode or invalid deckstring
                if (decoded_deckstring == null) {
                    decoded_deckstring = {};
                }

                decoded_deckstring['deckname'] = data[i].deckname;
                decoded_deckstring['deckcode'] = data[i].deckcode;
                deck_info.push([decoded_deckstring]);
                deck_names.push(data[i].deckname);
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

    db_api.delete_deck(userid, deckcode, function(err, data){
        if(err){
            console.log(err.message);
            console.log('Delete deck failed');
        } else{
            console.log(req.query.userid);
            console.log(req.query.deckcode);
            console.log(data);
        }
    });
    res.send('delete deck');
});

/*
    converts a card list to a json for easier comparisons
 */
var convert_card_list_to_json = function (cardlist, done) {
    var card_json = {};

    for (var i = 0; i < cardlist.length; i ++) {
        card_json[cardlist[i][0]] = cardlist[i][1];
    }
    done(card_json);
};


/*
    compares two same deckjsons and sees if played_deckjson is a derivative of saved_deckjson
 */
var compare_played_deckjson_to_saved_deckstring = function(saved_deckjson, played_deckjson) {

    // iterate over every played card id
    for (var cardid in played_deckjson) {
        // played card should be in saveddeck have been played <= to num in saveddeck
        if (cardid in saved_deckjson && saved_deckjson[cardid] >= played_deckjson[cardid]) {
        } else {
            return false;
        }
    }
    return true;
};

/*
    checks if played deck is in user submitted deck
    will need to update to check if in tournament
    expected post method with json in body, formatted like:

     {
        "userid": 1,
        "deckjson" : {
            "1": 1,
            "2" : 5
     }
 }
 */
router.post('/validate_decklist', function(request, res) {
    // post request, get info from body
    var played_deckjson = request.body;

    // get users saved decklists
    db_api.get_user_decklists(played_deckjson['userid'], function (err, deck_strings) {
        if (err) {
            res.send(err.message);
        }

        // assumes match is fair until mismatch is found
        var fair_match = true;

        // don't want to return true if no decklist is found, so keep track of that
        var deck_match = false;

        // iterate over decklists returned from get_user_decklists
        var promises = deck_strings.map(function (item) {
            var saved_deckcode = decode(item.deckcode);

            // if deckcode converted properly played cards not in a saved deckstring
            if (saved_deckcode != null) {
                deck_match = true;

                // convert decklist to json
                convert_card_list_to_json(saved_deckcode['cards'], function(saved_deckjson) {

                    // compare for fairness
                    if (!compare_played_deckjson_to_saved_deckstring(saved_deckjson, played_deckjson['deckjson'])) {
                        fair_match = false;
                    }
                });
            }
        });

        // wait for checking to complete
        Promise.all(promises).then(function() {
            fair_match = fair_match && deck_match;
            res.send(JSON.stringify({ success : true, fair_match : fair_match}))
        })
    });
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

/* create new tournament
 * input: param: tournament name, number of decks
 * return: { 'success' : true/false, 'error' : none/error_code }*/
router.get('/create_tournament', function(req, res) {
    var name = req.query.name;
    var numDecks = req.query.numDecks;

    db_api.create_tournament(name, numDecks, function(err, tournamentid) {

        // likely tournament already created
        if(err) {
            console.log(err.message);
            res.send(JSON.stringify({success : false, error: err.message}));
        }
        else {
            res.send(JSON.stringify({success : true, id : tournamentid}));
        }
    });
});


/* input: params: userid, deckcode
 * return: { 'success' : true/false, 'error' : none/error_code }*/
router.get('/delete_tournament', function(req, res) {
    var tournamentid= req.query.tournamentid;

    db_api.delete_tournament(tournamentid, function(err, data){
        if(err){
            console.log(err.message);
            res.send(JSON.stringify({success : false, error: err.message}));
        } else {
            res.send(JSON.stringify({success: true}));
        }
    });
});

router.get('/join_tournament', function(req, res) {
    var userid = req.query.userid;
    var tournamentid = req.query.tournamentid;

    db_api.join_tournament(userid, tournamentid, function(err, numDecks) {
        if(err) {
            console.log(err.message);
            res.send(JSON.stringify({ success : false, err : err.message }))
        } else {
            res.send(JSON.stringify({success: true, numDecks: numDecks}));
        }
    })
});

/*return: { 'success' : true/false, 'error' : none/error_code }*/
router.get('/create_tournament', function(req, res) {
    var name = req.query.name;
    var numDecks = req.query.numDecks;

    db_api.create_tournament(name, numDecks, function(err, tournamentid) {

        // likely tournament already created
        if(err) {
            console.log(err.message);
            res.send(JSON.stringify({success : false, error: err.message}));
        }
        else {
            res.send(JSON.stringify({success : true, id : tournamentid}));
        }
    });
});

router.get('/create_match', function(req, res)
{
    var homeTeamId = req.query.homeTeamId;
    var awayTeamId= req.query.awayTeamId;
    var winningTeamId= req.query.winningTeamId;
    var isValid= req.query.isValid;

    db_api.create_match(homeTeamId, awayTeamId, winningTeamId, isValid, function(err, matchid)
    {
        if(err)
        {
            console.log(matchid);
            console.log(err.message);
            res.send(JSON.stringify({success : false, error: err.message}));
        }
        else
        {
            console.log(matchid);
            res.send(JSON.stringify({success : true, id : matchid}));
        }
    });

});

router.get('/delete_match', function (req, res)
{
   var matchid = req.query.matchid;

   db_api.delete_match(matchid, function(err, status)
   {
       if(err)
       {
           console.log(JSON.stringify(status));
           res.send(JSON.stringify({success: false, error: err.message}));
       }
       else
       {
           console.log(JSON.stringify(status));
           res.send(JSON.stringify({success: true}));
       }
   })

});

router.get('/get_match', function(req, res)
{
    var matchid = req.query.matchid;

    db_api.get_match(matchid, function(err, status)
    {
        if(err)
        {
            console.log(JSON.stringify(status));
            res.send(JSON.stringify({success: false, error: err.message}));
        }
        else
        {
            console.log(JSON.stringify(status));
            res.send(JSON.stringify({success: true}));
        }
    })
});

module.exports = router;
