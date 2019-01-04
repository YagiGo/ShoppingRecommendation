let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let app = express();

// Set up a whitelist and check against it:
// ADD YOUR API HERE SO THAT IT WON'T BE BLOCKED
var whitelist = [
    "http://localhost:8081/api/urlToBeAnalyzed",
    "http://localhost:3000",
    "http://localhost:8081/api/getUrls"];
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors()); // Allow CORS with whitelist
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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


let server = app.listen(8081, function () {

    let host = server.address().address;
    let port = server.address().port;

    console.log("访问地址为 http://{}:%s", host, port)


})

module.exports = app;
