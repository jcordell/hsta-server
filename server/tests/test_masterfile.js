var supertest = require('supertest');
var should = require('should');
var server = supertest.agent("http://localhost:3000");

// connect to app (hearthstone server)
var app = require('../app.js')('test');

// start app on port 3000
app.listen(3000);

// import all tests

require('../tests/test_add_deck.js');
require('../tests/test_create_user.js');
require('../tests/test_delete_deck.js');
require('../tests/test_get_decklists.js');
require('../tests/test_update_decklist_name.js');
require('../tests/test_validate_decklist.js');
require('../tests/test_create_tournament');
require('../tests/test_delete_tournament');
require('../tests/test_join_tournament');
require('../tests/test_create_match');
require('../tests/test_delete_match');

