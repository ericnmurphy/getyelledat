const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const session = require('express-session');
const flash = require('connect-flash')
const passwordless = require('passwordless');
const MongoStore = require('passwordless-mongostore');
const email = require("emailjs");
const mongoose = require('mongoose');

//keys
const keys = require('./config/keys');

mongoose.connect(keys.mongoURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database is connected!');
});

//require User model
require('./models/User');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

//smtp setup
var smtpServer  = email.server.connect({
  user: 'ericnmurphy@gmail.com',
  password: 'aeuycsryqbfrppig',
  host: 'smtp.gmail.com',
  port: 465,
  ssl: true
});

//passwordless init
passwordless.init(new MongoStore(keys.mongoURI));

passwordless.addDelivery(
  function(tokenToSend, uidToSend, recipient, callback) {
      const host = 'localhost:3000';
      smtpServer.send({
          text:    'Hello!\nAccess your account here: http://'
          + host + '?token=' + tokenToSend + '&uid='
          + encodeURIComponent(uidToSend),
          from:    'ericnmurphy@gmail.com',
          to:      recipient,
          subject: 'Token for ' + host
      }, function(err, message) {
          if(err) {
              console.log(err);
          }
          callback(err);
      });
});

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//express-session
var sess = {
  secret: 'd6V4dbK0eHZySXbLJE',
  cookie: {},
  resave: false,
  saveUninitialized: false
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));

//express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passwordless middleware
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
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

module.exports = app;
