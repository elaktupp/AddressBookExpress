var mongoose = require('mongoose');
var uri = "mongodb://localhost/addressbook";

exports.connectToDb = function(req,res) {
    
    if(mongoose.connection.readyState)
    {
        res.render('index', {title: 'Address Book login', error: ''});
    } else {
        // Try to connect to MongoDB
        mongoose.connect(uri, function(err,ok) {
            if (err) {
                console.log("ERROR: "+err);
                res.render('error', {error: err, error_info: 'Database connection failed!'});
            } else {
                console.log("CONNECTED: "+uri);
                res.render('index', {title: 'Address Book login', error: ''});
            }
        });
    }
};

//
// THE DATA
//

var Schema = mongoose.Schema;

var bookUser = new Schema({
    username:{type:String,index:{unique:true}},
    password:String,
    email:String
});

var BookUser = mongoose.model('BookUser', bookUser);

// The last one 'user:String' must be BookUser's username
// with that we can find items that belong to that user.

var contact = new Schema({
    name:{type:String},
    address:String,
    email:String,
    phonenumber:String,
    birthday:Date,
    notes:String,
    user:String
});

var Contact = mongoose.model('Contact', contact);

//
// THE USER HANDLING
//
exports.addUser = function(req,res) {
    
    console.log("*** addUser "+req.body.username);
    // Sanity check
    if (req.body.username === '') {
        res.render('register',{error_msg:'Username is missing!',
                               username:req.body.username,
                               password:req.body.password,
                               email:req.body.email});
    } else if (req.body.password === '') {
        res.render('register',{error_msg:'Password is missing!',
                               username:req.body.username,
                               password:req.body.password,
                               email:req.body.email});
    } else if (req.body.email === '') {
        res.render('register',{error_msg:'E-mail address is missing!',
                               username:req.body.username,
                               password:req.body.password,
                               email:req.body.email});
    } else {
        // NOTE: Body content names come from register.jade
        // So they do not have to be the same like they are now,
        // but it makes sense.
        var temp = new BookUser({
            username:req.body.username,
            password:req.body.password,
            email:req.body.email
        });

        temp.save(function(err) {
            if (err) {
                // This is code for case when there is duplicate unique data field
                if (err.code === 11000) {
                    res.render('register',{error_msg: 'This username already exists, try another!',
                                           username:req.body.username,
                                           password:req.body.password,
                                           email:req.body.email});
                } else {
                    res.render('register',{error_msg: 'Failed to add the user to the database!',
                                           username:req.body.username,
                                           password:req.body.password,
                                           email:req.body.email});
                }
            } else {
                console.log("DONE with save");
                res.render('index', {title: 'Address Book login', error: ''});
            }
        });
    }
};

exports.loginUser = function(req,res) {

    console.log("*** loginUser: "+req.body.username+" "+req.body.password);
    // Fetch data from the database
    BookUser.findOne({username: req.body.username, password: req.body.password}, 'username', function(err,data) {
        // Then render error or data
        if (err) {
            res.render('index', {error: 'Cannot access database! '+err});
        } else {
            // findOne is null if nothing is found i.e. no such user
            if (data !== null) {
                req.session.loggedIn = true;
                req.session.username = data.username;
                exports.renderUsersAddressList(req,res);
            } else {
                res.render('index', {error: 'Username or password incorrect!'});
            }
        }
    });
};

//
// THE BOOK CONTENT HANDLING
//
exports.addContact = function(req,res) {
    
    if (req.session.loggedIn) {
        console.log("*** addContact: "+req.body.birthday);
        // NOTE: Body content names come from address.jade, so they
        // do not need to be the same as in scheme like they are now
        var temp = new Contact({
            name:req.body.name,
            address:req.body.address,
            email:req.body.email,
            phonenumber:req.body.phonenumber,
            birthday:new Date(req.body.birthday),
            notes:req.body.notes,
            user:req.session.username
        });

        temp.save(function(err) {
            if (err) {
                // see views/error.jade
                res.render('error', {error: err, error_info: 'Database write failed!'});
            } else {
                //exports.renderUsersAddressList(req,res);
                res.redirect('/addresslist');
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

exports.renderUsersAddressList = function(req,res) {

    if (req.session.loggedIn) {
        Contact.find({user: req.session.username}, function(err,data) {
            if (err) {
                res.render('error', {error: err, error_info: 'Database read failed!'});
            } else {
                
                console.log("*** renderUsersAddressList: "+data);
                
                // find returns array, but it might be empty hence check length
                // but we let addresslist.jade do the checking
                res.render('addresslist', {db_addresses: data});
                
// NOT-IN-USE: Accordion is fun view, but don't know how to combine it with the list & search
                //res.render('addressaccordion', {db_addresses: data});
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

exports.getAddressDetails = function(req,res) {
    
    if (req.session.loggedIn) {
        // Fetch data from the database
        Contact.findById(req.query.id, function(err,data) {
            if (err) {
                res.render('error', {error: err, error_info: 'Database read failed!'});
            } else {
                res.render('details', data);
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};