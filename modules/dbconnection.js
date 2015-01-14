var mongoose = require('mongoose');
var uri = "mongodb://localhost/addressbook";

// Try to connect to MongoDB
mongoose.connect(uri,function(err,res) {
    if (err) {
        console.log("ERROR: "+err);
    } else {
        console.log("CONNECTED: "+uri);
    }
});

var Schema = mongoose.Schema;

var bookItem = new Schema({
    name:{type:String,index:{unique:true}},
    address:String,
    email:String,
    phonenumber:String,
    birthday:Date,
    notes:String
});

var AddressBook = mongoose.model("AddressBook", bookItem);

var bookUser = new Schema({
    name:{type:String,index:{unique:true}},
    password:String
});

var BookUser = mongoose.model("BookUser", bookUser);

// User handling

exports.addBookUser = function(req,res) {
    
    // TODO
    console.log(req.body);
    res.redirect('/');
};

// Book handling

exports.addBookItem = function(req,res) {
    
    // TODO
    console.log(req.body);
    res.redirect('/');
};