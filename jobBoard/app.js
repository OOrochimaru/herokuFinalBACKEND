var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');


var isProduction = process.env.NODE_ENV === 'production';


//var createError = require('http-errors');
//var cookieParser = require('cookie-parser');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

//config details
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// view engine setup
app.use(require('method-override')());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({secret:'jobportal', cookie:{maxAge:60000}, resave:false,
 saveUninitialized:false}))


 if (!isProduction) {
   app.use(errorhandler());
 }
 if (isProduction) {
   
   mongoose.connect('mongodb://localhost:27017/jobPortal');
  //  mongoose.connect(process.env.MONGODB_URI);
 }else{
// mongoose.connect('mongodb://ryam:ryam1234@ds213183.mlab.com:13183/jobportal');
   mongoose.connect('mongodb://localhost:27017/jobPortal');
   mongoose.set('debug', true);
 }
require('./config/passport');

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

var server = app.listen(process.env.PORT || 4000, function(){
  console.log('listening to port '+ server.address().port);
});

// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
