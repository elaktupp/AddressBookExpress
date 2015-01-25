var express = require('express');
var router = express.Router();

// Database for users and addresses
var db = require('./dbconnection');

/* GET home page. */
router.get('/', function(req, res) {
    db.connectToDb(req,res);
});

router.displayRegisterForm = function(req,res) {
    res.render('register_form', {error_msg:'', username:'', password:'', email:''});
};

router.displayContactForm = function(req,res) {
    if (req.session.loggedIn) {
        res.render('contact_form', {});
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

router.logout = function(req,res) {

    req.session.destroy();
    res.status(301);
    res.setHeader('location','/');
    res.render('index', {title: 'Address Book login', error: ''});
}

module.exports = router;
