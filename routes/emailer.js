var email = require('emailjs');
// Database to get the contact data. Could have sent the
// email address in req, but we need data to get nicely
// back to the details view... or that's what I think.
var db = require('./dbconnection');

var emailMessage = {
    hostUsername:String,
    hostPassword:String,
    host:String,
    ssl:Boolean,
    sender:String,
    recipient:String,
    subject:String,
    message:String
};

exports.newEmail = function(req,res) {
  
    // First get the user data and take needed information for the email
    db.BookUser.findOne({username: req.session.username}, 'email host ssl', function(err,data) {
        
        emailMessage.hostUsername = data.hostUsername;
        emailMessage.hostPassword = data.hostPassword;
        emailMessage.sender = data.email;
        emailMessage.host = data.host;
        emailMessage.ssl = data.ssl;
    });
    
// TODO: Since we have this stuff in the users data then there should also be a USER EDITOR !
    
    db.Contact.findById(req.query.id, function(err,data) {

        if (err || emailMessage.host === null) {
            // Contact data failure or the user did not have needed email data
            res.render('contact_details',data);
        } else {
            // Get the recipient
            emailMessage.recipient = data.email;
        }
    });
    
    // We should have everything, next to the email editor
    res.render('emailer',emailMessage);
};

exports.sendEmail = function(req,res) {
  
    // Note. sender ofter equals hostUsername
    console.log("*** sendEmail "+req.body.hostUsername);
    console.log("*** sendEmail "+req.body.hostPassword);
    console.log("*** sendEmail "+req.body.sender);
    console.log("*** sendEmail "+req.body.host);
    console.log("*** sendEmail "+req.body.ssl);
    console.log("*** sendEmail "+req.body.recipient);
    console.log("*** sendEmail "+req.body.subject);
    console.log("*** sendEmail "+req.body.message);
    
    var server = email.server.connect({
       user: req.body.hostUsername, 
       password: req.body.hostPassword, 
       host: req.body.host, 
       ssl: req.body.ssl
    });
    /*
    server.send({
        text: req.body.message, 
        from: req.body.sender, 
        to: req.body.recipient,
        cc: "",
        subject: req.body.subject
    }, function(err, message) {
        
        emailMessage.sender = req.body.sender;
        emailMessage.host = req.body.host;
        emailMessage.ssl = req.body.ssl;
        emailMessage.recipient = req.body.recipient;
        emailMessage.subject = req.body.subject;
        emailMessage.message = req.body.message;
        emailMessage.hostUsername = req.body.hostUsername;
        emailMessage.hostPassword = req.body.hostPassword;
        
// TODO: Error message - now we just go back anyway!
        
        if (err) {
            res.render('emailer',emailMessage);
        } else {
            res.render('emailer',emailMessage);
        }
    });
    */
};
