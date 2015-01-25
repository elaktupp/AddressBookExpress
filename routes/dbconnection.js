var fs = require('fs');
var mongoose = require('mongoose');
var uri = "mongodb://localhost/addressbook";

if(process.env.OPENSHIFT_MONGODB_DB_URL) {
    uri = process.env.OPENSHIFT_MONGODB_DB_URL + "addressbook";
}

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
// THE DATA DEFINITION
//

var Schema = mongoose.Schema;

var bookUser = new Schema({
    username:{type:String,index:{unique:true}},
    password:String,
    email:String,
    host:String,
    ssl:Boolean,
    hostUsername:String,
    hostPassword:String
});

exports.BookUser = mongoose.model('BookUser', bookUser);

// The last one 'user:String' must be BookUser's username
// with that we can find items that belong to that user.

var contact = new Schema({
    name:String,
    address:String,
    email:String,
    phonenumber:String,
    birthday:String,
    notes:String,
    image:String,
    user:String
});

exports.Contact = mongoose.model('Contact', contact);

//
// THE USER HANDLING
//
exports.addUser = function(req,res) {
    
    // Sanity check
    if (req.body.username === '') {
        res.render('register_form',{error_msg:'Username is missing!',
                               username:req.body.username,
                               password:req.body.password,
                               email:req.body.email,
                               host:req.body.host,
                               ssl:req.body.ssl,
                               hostUsername:req.body.hostUsername,
                               hostPassword:req.body.hostPassword});
    } else if (req.body.password === '') {
        res.render('register_form',{error_msg:'Password is missing!',
                               username:req.body.username,
                               password:req.body.password,
                               email:req.body.email,
                               host:req.body.host,
                               ssl:req.body.ssl,
                               hostUsername:req.body.hostUsername,
                               hostPassword:req.body.hostPassword});
    } else if (req.body.email === '') {
        res.render('register_form',{error_msg:'E-mail address is missing!',
                               username:req.body.username,
                               password:req.body.password,
                               email:req.body.email,
                               host:req.body.host,
                               ssl:req.body.ssl,
                               hostUsername:req.body.hostUsername,
                               hostPassword:req.body.hostPassword});
    } else {
        // NOTE: Body content names come from register_form.jade
        // So they do not have to be the same like they are now,
        // but it makes sense.
        var temp = new exports.BookUser({
            username:req.body.username,
            password:req.body.password,
            email:req.body.email,
            host:req.body.host,
            ssl:req.body.ssl,
            hostUsername:req.body.hostUsername,
            hostPassword:req.body.hostPassword
        });

        temp.save(function(err) {
            if (err) {
                // This is code for case when there is duplicate unique data field
                if (err.code === 11000) {
                    res.render('register_form',{error_msg: 'This username already exists, try another!',
                                           username:req.body.username,
                                           password:req.body.password,
                                           email:req.body.email,
                                           host:req.body.host,
                                           ssl:req.body.ssl,
                                           hostUsername:req.body.hostUsername,
                                           hostPassword:req.body.hostPassword});
                } else {
                    res.render('register_form',{error_msg: 'Failed to add the user to the database!',
                                           username:req.body.username,
                                           password:req.body.password,
                                           email:req.body.email,
                                           host:req.body.host,
                                           ssl:req.body.ssl,
                                           hostUsername:req.body.hostUsername,
                                           hostPassword:req.body.hostPassword});
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
    exports.BookUser.findOne({username: req.body.username, password: req.body.password}, 'username', function(err,data) {
        // Then render error or data
        if (err) {
            res.render('index', {error: 'Cannot access database! '+err});
        } else {
            // findOne is null if nothing is found i.e. no such user
            if (data !== null) {
                req.session.loggedIn = true;
                req.session.username = data.username;
                exports.renderUsersContactList(req,res);
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
    
    var path = process.cwd()+"/images/";
    
    if (req.files.image === undefined) {
        path += "unknown.png";
    } else {
        path += req.files.image.name;
    }
    
    console.log("*** PATH: "+path);
        
    if (req.session.loggedIn) {
        console.log("*** addContact: "+req.body.birthday);
        // NOTE: Body content names come from address.jade, so they
        // do not need to be the same as in scheme like they are now
        var temp = new exports.Contact({
            name:req.body.name,
            address:req.body.address,
            email:req.body.email,
            phonenumber:req.body.phonenumber,
            birthday:new Date(req.body.birthday).toLocaleDateString(),
            notes:req.body.notes,
            image:path,
            user:req.session.username
        });

        temp.save(function(err) {
            if (err) {
                // see views/error.jade
                res.render('error', {error: err, error_info: 'Database write failed!'});
            } else {
                res.redirect('/contact_list');
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

exports.renderUsersContactList = function(req,res) {

    if (req.session.loggedIn) {
        exports.Contact.find({user: req.session.username}, function(err,data) {
            if (err) {
                res.render('error', {error: err, error_info: 'Database read failed!'});
            } else {
                // find returns array, but it might be empty hence check length
                // but we let contact_list.jade do the checking
                res.render('contact_list', {db_addresses: data});
                
// NOT-IN-USE: Accordion is fun view, but don't know how to combine it with the list & search
                //res.render('addressaccordion', {db_addresses: data});
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

exports.displayContactDetails = function(req,res) {
    
    if (req.session.loggedIn) {
        // Fetch data from the database
        exports.Contact.findById(req.query.id, function(err,data) {
            if (err) {
                res.render('error', {error: err, error_info: 'Database read failed!'});
            } else {
                res.render('contact_details', data);
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

exports.fetchImageFile = function(req,res) {
    
    if (req.session.loggedIn) {
        // Fetch image from the database
        exports.Contact.findById(req.query.id, function(err,data) {
            if (err) {
                res.render('error', {error: err, error_info: 'Database read failed!'});
            } else {
                res.sendfile(data.image);
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
};

exports.removeContact = function(req,res) {
    
    if (req.session.loggedIn) {
        // Fetch data from the database
        exports.Contact.findOne(req.query.id, function(err,data) {
            data.remove();
            res.send('ok');
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }
}

exports.editContact = function(req,res) {
    
    if (req.session.loggedIn) {
        // Fetch image from the database
        exports.Contact.findById(req.query.id, function(err,data) {
            if (err) {
                res.render('error', {error: err, error_info: 'Database read failed!'});
            } else {
                res.render('contact_edit', data);
            }
        });
    } else {
        res.render('index', {error: 'Please login first!'});
    }    
}

exports.updateContact = function(req,res) {

    var path = null;
    
    if (req.session.loggedIn) {
        
        exports.Contact.findById(req.body.id, function (err, data) {
            
            if (err) {
                res.render('error', {error: err, error_info: 'Database read failed!'});
            } else {
                // If the user selects both the remove and the new image we
                // will use the new image.
                if (req.body.photoAction === "remove" && req.files.image === undefined) {
                    // OK to remove i.e. set unknown.png as image path
                    path = process.cwd()+"/images/unknown.png";
                    
                    var str = data.image.toString();

                    console.log("*** UNLINK "+data.image);
                    console.log("*** UNLINK "+str);
                    console.log("*** UNLINK "+str.search("unknown.png"));
                    
                    if (str.search("unknown.png") == -1) {
                        // OK to delete this is not the default photo,
                        // but we need to get the filename without the path.
                        // We know to search for '/' instead of '\' since
                        // the images are put into '/images/' folder.
                        var filename = str.slice(str.lastIndexOf('/'),str.length);
                        
                        fs.unlink("images"+filename, function (err) {
                            console.log("*** ERR? "+err);
                        });
                    }
                    
                } else if (req.files.image !== undefined) {
                    // New photo selected
                    path = process.cwd()+"/images/"+req.files.image.name;
                } else {
                    // Keep the old value
                    path = data.image;
                }
                
                data.name = req.body.name;
                data.address = req.body.address;
                data.email = req.body.email;
                data.phonenumber = req.body.phonenumber;
                data.birthday = req.body.birthday;
                data.image = path;
                data.notes = req.body.notes;
                
                data.save(function (err) {
                    if (err) {
                        res.render('error', {error: err, error_info: 'Database write failed!'});
                    }
                });
            }
            
            res.render('contact_details',data);
        });
        
    } else {
        res.render('index', {error: 'Please login first!'});
    }    
}