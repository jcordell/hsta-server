var mysql = require('mysql');
var parse = require('csv-parse');
var fs = require('fs');
var cardJSON = 'json_data/card-data.json';
var isCreated=0;
var index = 0;


//holds json_data
var cardOutput = [];
var cardID = [];
var cardName = [];
var cardClass = [];
var deckCode = [];



// creates the stream to read in CSV's from file if we ever use CSV's
/*fs.createReadStream(cardCSV).pipe(parse())
    .on('data',function(csvrow) {
        cardOutput.push(csvrow);
    }); */

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
   "DROP TABLE card",
    "CREATE TABLE IF NOT EXISTS card (name VARCHAR(255), class VARCHAR(255), id VARCHAR(255), PRIMARY KEY (id)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS has (cardid VARCHAR(255), deckcode VARCHAR(255)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS user (userid INT NOT NULL AUTO_INCREMENT, email VARCHAR(255) NOT NULL UNIQUE, PRIMARY KEY (userid)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS ownedBy " +
        "(deckname VARCHAR(255) NOT NULL, " +
        "userid INT NOT NULL, " +
        "deckcode VARCHAR(255) NOT NULL, " +
        "PRIMARY KEY (userid, deckcode), " +
        "FOREIGN KEY (userid) REFERENCES user (userid) ON DELETE CASCADE) ENGINE = InnoDB",
    "CREATE TABLE IF NOT EXISTS tournament (tournamentid INT NOT NULL AUTO_INCREMENT, name VARCHAR(255)," +
        "numDecks INT unsigned, PRIMARY KEY (tournamentid)) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS playsInTournament (tournamentid INT NOT NULL, userid INT NOT NULL," +
        "PRIMARY KEY (tournamentid, userid)," +
        "FOREIGN KEY (tournamentid) REFERENCES tournament (tournamentid) ON DELETE CASCADE," +
        "FOREIGN KEY (userid) REFERENCES user (userid) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS matches " +
        "(matchid INT NOT NULL AUTO_INCREMENT, homeTeamId INT, awayTeamId INT, winningTeamId INT, isValid INT, PRIMARY KEY (matchid)) ENGINE=InnoDB"

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
    populate(index);
    //bulkloading JSON files into DB
    function populate(index) {
        if (index === 0) {
            fs.readFile(cardJSON, 'utf8', function (err, data) {
                if (err) throw err;

                //JSON parse command
                data = JSON.parse(data);
                for (i = 0; i < data.length; i++) {

                    //pull info from JSON file
                    cardID[i] = (data[i].dbfId);
                    cardName[i] = (data[i].name);
                    cardClass[i] = (data[i].cardClass);


                    //put data into one array to easily import into DB
                    cardOutput.push([cardName[i], cardClass[i], cardID[i]]);

                }
                //inserts card data into DB
                con.query("INSERT INTO card (name, class, id) VALUES ?", [cardOutput], function (err) {
                    if (err) throw err;
                });
                console.log("Card table populated");
                if (index === 0)
                    populate(index+1);
            });

        }
        if (index === 1) {
            console.log("hsdb initializer finished");
            con.end();
            return;
        }
    }

});

