var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'),
    secret = require('./config').secret;


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
app.use(session({secret: secret, cookie:{maxAge:60000}, resave:false,
 saveUninitialized:false}))


//  if (!isProduction) {
//    app.use(errorhandler());
//  }
 if (isProduction) {
   
   mongoose.connect('mongodb://localhost:27017/jobPortal');
  // mongoose.connect('mongodb://ryam:ryam1234@ds213183.mlab.com:13183/jobportal');
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


// error handler

// development error handler
// will print stacktrace
// if (!isProduction) {
//   app.use(function(err, req, res, next) {
//     console.log(err.stack);

//     res.status(err.status || 500);

//     res.json({'errors': {
//       message: err.message,
//       error: err
//     }});
//   });
// }


// app.get('*', function(req, res, next){

//   setImmediate(() => {
//     next(new Error('woops thers an error'))
//   })
//   // throw new Error("woops ther's an error");
// })

app.get('/errors', function(req, res, next) {
  // This middleware is not an error handler (only 3 arguments),
  // Express will skip it because there was an error in the previous
  // middleware
  console.log('this will not print');
  var error = new Error('Woops there is an error');
  error.status = 405;

  return next(error);
});


app.get('*', function(req, res, next) {
  // This middleware is not an error handler (only 3 arguments),
  // Express will skip it because there was an error in the previous
  // middleware
  console.log('this will not print');
  var error = new Error('no route');
  error.status = 405;

  return next(error);
});

// production error handler
// no stacktraces leaked to user
app.use(function(error, req, res, next) {
  res.status(error.status || 500);
  res.json({'errors': {
    message: error.message,
    error: error.status
  }});
});
// app.get('*', function(req, res, next){

//   setImmediate(() => {
//     next(new Error('woops thers an error'))
//   })
//   // throw new Error("woops ther's an error");
// })


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
