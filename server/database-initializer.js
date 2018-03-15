var mysql = require('mysql');
var isCreated=0;
//var csv_parser = require('csv-parse');


//Create connection to the database
var con;

if(isCreated===1)
{
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Badgers1!",
        database: "hsdb"
    });
}
else
{
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Badgers1!"
    });

    isCreated= 1;
}


function createDB() {
    con.query("CREATE DATABASE hsdb", function (err, result) {
        console.log("Database created"); //DEBUG
    });

    con.query('USE hsdb', function (err, result) {
        console.log("hsdb ready for use"); //DEBUG
    });
}

var cmds = [
 //   "DROP TABLE",
    "CREATE TABLE IF NOT EXISTS card (name VARCHAR(255), class VARCHAR(255), id VARCHAR(255), PRIMARY KEY (id)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS deck (class VARCHAR(255), deckcode VARCHAR(255) NOT NULL, PRIMARY KEY (deckcode)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS has (cardid VARCHAR(255), deckcode VARCHAR(255)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS user (userid INT NOT NULL AUTO_INCREMENT, email VARCHAR(255) NOT NULL UNIQUE, PRIMARY KEY (userid)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS ownedBy " +
        "(deckname VARCHAR(255) NOT NULL, " +
        "userid INT NOT NULL, " +
        "deckcode VARCHAR(255) NOT NULL, " +
        "PRIMARY KEY (userid, deckcode), " +
        "FOREIGN KEY (userid) REFERENCES user (userid) ON DELETE CASCADE, " +
        "FOREIGN KEY (deckcode) REFERENCES deck (deckcode) ON DELETE CASCADE) ENGINE = InnoDB"
]


con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    try {
        createDB();
        console.log("hsdb sucessfully created!"); //DEBUG
    }
    catch (ER_DB_CREATE_EXISTS) {
        con.query("DROP DATABASE IF EXISTS hsdb");
        createDB();
    }

    // iterate over queries and execute them
    for (var i = 0; i < cmds.length; i++ ) {
        con.query(cmds[i], function (err, result) {
            if (err) throw err;
        });
    }
   console.log("Tables initialized");
});

