var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var api = require('./routes/api');
var app = express();

var cors = require('cors');

app.use(cors({origin:true,credentials: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// database connection
var db = require('./db')

// Connect to MySQL on start
db.connect(db.MODE_PRODUCTION, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.')
        process.exit(1)
    } else {
        console.log('connected to database');
        //app.listen(3000, function() {
        //    console.log('Listening on port 3000...')
        //})
    }
})

/*
connect to database specified
export still returns app
usage: var app = require(app.js)(database_mode)
 */
module.exports = function(database_mode) {
    // Connect to MySQL on start
    if (database_mode == 'prod') {
        db.connect(db.MODE_PRODUCTION, function(err) {
                if (err) {
                    console.log('Unable to connect to MySQL.')
                    process.exit(1)
                } else {
                    console.log('connected to database');
                    //app.listen(3000, function() {
                    //    console.log('Listening on port 3000...')
                    //})
                }
            }
    )} else if (database_mode == 'test') {
        db.connect(db.MODE_TEST, function(err) {
            if (err) {
                console.log('Unable to connect to MySQL.')
                process.exit(1)
            } else {
                console.log('connected to database');
                //app.listen(3000, function() {
                //    console.log('Listening on port 3000...')
                //})
            }
        }
        )} else {
            console.log('app.js usage: var app = require(app.js)(database_mode)')
            process.exit(1);
        }
    return app;
};
