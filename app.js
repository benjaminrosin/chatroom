const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sequelize = require('./models/index');
const session = require('express-session')
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const chatRouter = require('./routes/chatroom');
//const passwordRouter = require('./routes/password');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

app.use(session({
  secret: 'secretSessionId',
  resave: false,
  saveUninitialized: false,
  lastUpdated: new Date(),
  cookie: {maxAge: 60 * 60 * 1000} // 1 hour
}));

app.get('/', function(req, res, next) {
  if (false /*&& !req.session.user || !req.session.user.isLoggedIn*/) {
    return res.redirect('/login');
  }
  else{
    return res.redirect('/chatroom');
  }
  //next();
});

app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/chatroom', chatRouter);

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
