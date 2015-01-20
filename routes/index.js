var express = require('express');
var router = express.Router();

// Database for users and addresses
var db = require('./dbconnection');

/* GET home page. */
router.get('/', function(req, res) {
    db.connectToDb(req,res);
});

router.register = function(req,res) {
    res.render('register', {error_msg:'', username:'', password:'', email:''});
};

router.address = function(req,res) {
    if (req.session.loggedIn) {
        res.render('address', {});
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

router.logout = function(req,res) {

    req.session.destroy();
    res.render('index', {title: 'Address Book login', error: ''});
}

module.exports = router;
