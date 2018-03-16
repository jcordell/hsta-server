var express = require('express');
var router = express.Router();
var app= require('../app');

/* GET user decklists. */
router.get('/get_user_decklists', function(req, res) {
  res.send('respond with a get_user_decklist');
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

/* GET users listing. */
router.get('/create_user', function(req, res) {
  res.send('respond with a create user');
});
module.exports = router;
