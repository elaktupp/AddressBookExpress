var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ABE' });
});

router.get('/register', function(req,res) {
    res.render("register", {});
});

router.post('/login', function(req,res) {
    res.render("addresslist", {});
});

module.exports = router;
