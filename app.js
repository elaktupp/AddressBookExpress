var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// session is used to secure the pages
var session = require('express-session');
var app = express();
// Set cookie maxAge to null. This makes sure that session is deleted when user closes the browser
app.use(session({cookie:{path:'/', httpOnly:true, maxAge:null}, secret:'h43jhnf34q384fh3', resave: false, saveUninitialized: true}));
// Photo select
var multer  = require('multer');
// Database for users and addresses
var indexRoutes = require('./routes/index');
var dbRoutes = require('./routes/dbconnection');
var emailRoutes = require('./routes/emailer');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({ dest: './images/'}));

app.use('/', indexRoutes);
app.use('/register_form', indexRoutes.displayRegisterForm);
app.use('/contact_form', indexRoutes.displayContactForm);
app.use('/logout', indexRoutes.logout);
app.use('/login', dbRoutes.loginUser);
app.use('/add_user', dbRoutes.addUser);
app.use('/add_contact', dbRoutes.addContact);
app.use('/contact_details', dbRoutes.displayContactDetails);
app.use('/show_image', dbRoutes.fetchImageFile);
app.use('/contact_list', dbRoutes.renderUsersContactList);
app.use('/delete', dbRoutes.removeContact);
app.use('/edit', dbRoutes.editContact);
app.use('/update_contact', dbRoutes.updateContact);
app.use('/email', emailRoutes.newEmail);
app.use('/send_email', emailRoutes.sendEmail);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
