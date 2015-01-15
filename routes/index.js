var express = require('express');
var router = express.Router();

// Database for users and addresses
var db = require('../modules/dbconnection');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ABE' });
});

router.get('/register', function(req,res) {
    res.render("register", {});
});

router.loginUser = function(req,res) {
// TODO: Validate the user
    console.log(req);
    if (db.validateUser(req.body.name) === false) {
        // Invalid user or password
// TODO: jQuery popup "Incorrect username or password" would be nice
        res.redirect('/');
    } else {
// TODO: Fetch addresses belonging to the user
        res.render("addresslist", req.body.name);
    }
};

module.exports = router;
