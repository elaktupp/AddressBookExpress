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

var bookUser = new Schema({
    name:{type:String,index:{unique:true}},
    password:String,
    email:String
});

var BookUser = mongoose.model("BookUser", bookUser);

// TODO: If the Address Book can have several users
// but each address items must have unique 'name'
// what happens when two users have address item with
// same 'name'...?

// The last one 'user:String' must be bookUser.name
// with that we can find items that belong to that user.

var bookItem = new Schema({
    name:{type:String,index:{unique:true}},
    password:String,
    email:String,
    phonenumber:String,
    birthday:Date,
    notes:String,
    user:String
});

var BookItem = mongoose.model("AddressBook", bookItem);

// User handling

exports.addBookUser = function(req,res) {
    
    console.log("*** addBookUser");
    console.log(req.body);
    // NOTE: Body content names come from register.jade, so they
    // do not need to be the same like they are now
    var temp = new BookUser({
        name:req.body.name,
        password:req.body.password,
        email:req.body.email,
    });
    
    temp.save(function(err) {
        if (err) {
            // see views/error.jade
            res.render('dberror',{db_error:err});
        } else {
            res.redirect('/');
        }
    });
};

exports.validateUser = function(username) {
    // Fetch data from the database
    BookUser.find({name: username},function(err,data) {
        // Then render error or data
        if (err) {
            res.render('dberror',{db_error:err});
        } else {
            console.log(data);
            if (data.name != undefined) {
                console.log("validateUser TRUE");
                return true;
            } else {
                console.log("validateUser FALSE");
                return false;
            }
        }
    });
    
    console.log("validateUser FALSE");
    return false;
};

// Book handling

exports.addBookItem = function(req,res) {
    
    console.log(req.body);
    // NOTE: Body content names come from address.jade, so they
    // do not need to be the same like they are now
    var temp = new BookItem({
        name:req.body.name,
        address:req.body.address,
        email:req.body.email,
        phonenumber:req.body.phonenumber,
        birthday:new Date(req.body.birthday),
        notes:req.body.notes,
        user:req.body.user
    });
    
    temp.save(function(err) {
        if (err) {
            // see views/error.jade
            res.render('dberror',{db_error:err});
        } else {
            res.redirect('/');
        }
    });
};
