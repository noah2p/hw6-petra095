// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT
const createError = require('http-errors');

// Include the express module
const express = require('express');

// helps in extracting the body portion of an incoming request stream
const bodyparser = require('body-parser');

// Path module - provides utilities for working with file and directory paths.
const path = require('path');

// Helps in managing user sessions
const session = require('express-session');

// include the mysql module
const mysql = require('mysql');

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// Include the xml2js parser and file reading capabilities
const fs = require('fs');
const xml2js = require('xml2js');
const xmlparser = new xml2js.Parser();

// Include the express router.
const utilities = require('./api/utilities');
// sID = 5456002 so port is 9 + last 3 digits of sID = 9002
const port = 9002;

// create an express application
const app = express();

// first obtain the dbconfig xml and convert it to a JSON
var dbConfig;
fs.readFile(__dirname + '/dbconfig.xml', function (err, data) {
  if (err) {
    throw err;
  }
  // console.log("data: ", data);
  xmlparser.parseString(data, function (err2, result) {
    if (err2) {
      throw err2;
    }
    // console.log("result from xmlparser: ", result);
    dbConfig = result;
  });
});
/**
// attempt to create a connection using the newly created JSON
var connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port
});
*/

// set url encoder
var urlencodedparser = bodyparser.urlencoded({ extended: false });

// set login variable
var loggedin = false;

// set the router
var router = express.Router();
// Use express-session
// In-memory session is sufficient for this assignment
app.use(session({
        secret: "csci4131secretkey",
        saveUninitialized: true,
        resave: false
    }
));

// middle ware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// server listens on port 9002 for incoming connections
app.listen(process.env.PORT || port, () => console.log('Listening on port', port));

app.get('/', function (req, res) {
    // res.send("hello world");
    res.sendFile(path.join(__dirname, 'public/welcome.html'));
});

// GET method route for the contacts page.
// It serves contact.html present in public folder
app.get('/contacts', function(req, res) {
  // TODO: Add Implementation
  // console.log("Logged in? ", loggedin);
  if (loggedin) {
    res.sendFile(path.join(__dirname, 'public/contacts.html'));
  }
  else {
    res.sendFile(path.join(__dirname, 'public/login.html'));
  }
});

// TODO: Add implementation for other necessary end-points
// GET method route for the stocks page
// It serves stock.html present in public folder
app.get('/stock', function(req, res) {
  if (loggedin) {
    res.sendFile(path.join(__dirname, 'public/stocks.html'));
  }
  else {
    res.sendFile(path.join(__dirname, 'public/login.html'));
  }
});


// GET method route for the addContact page
app.get('/addContact', function(req, res) {
  if (loggedin) {
    res.sendFile(path.join(__dirname, 'public/addContact.html'));
  }
  else {
    res.sendFile(path.join(__dirname, 'public/login.html'));
  }
});
// GET method route for the welcome page
app.get('/welcome', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/welcome.html'));
});

// GET method route for login page
app.get('/login', function(req, res) {
  if (loggedin) {
    // send to contacts page instead
    res.sendFile(path.join(__dirname, 'public/contacts.html'));
  }
  else {
    res.sendFile(path.join(__dirname, 'public/login.html'));
  }
});

// GET method route for addContact form
app.get('/addContact', function(req, res) {
  if (loggedin) {
    res.sendFile(path.join(__dirname, 'public/addContact.html'));
  }
  else {
    res.sendFile(path.join(__dirname, 'public/login.html'));
  }
});


// GET method route for logout request
app.get('/logout', function(req, res) {
  if (!loggedin) {
    res.send("Session not started, cannot logout");
  }
  else {
    // log user out
    loggedin = false;
    req.session.destroy();
    console.log("Session complete, redirecting to login.html");
    res.redirect('/login');
  }
});

// GET method route for dynamically populate contacts.html
app.get('/getContact', function (req,res) {
  var connection = mysql.createConnection({
    host: dbConfig.dbconfig.host[0],
    user: dbConfig.dbconfig.user[0], 
    password: dbConfig.dbconfig.password[0], 
    database: dbConfig.dbconfig.database[0],
    port: dbConfig.dbconfig.port[0]
  });
  connection.connect(function(err) {
    if (err) {
      throw err;
    }
  });
  connection.query("SELECT * FROM tbl_contacts", function(err, result, fields) {
    if (err) {
      throw err;
    }
    // results is an array
    // each index in the array is a row
    // need to return the entries as a json so that contacts.html can parse it
    var results = JSON.parse(JSON.stringify(result));
    res.json(results);
  });
  connection.end();
});

// POST login request from login form
app.post('/authenticate', urlencodedparser, function(req, res) {
  var user = req.body.username;
  var pass = req.body.password;

  if (user && pass) {
    var connection = mysql.createConnection({
      host: dbConfig.dbconfig.host[0],
      user: dbConfig.dbconfig.user[0],
      password: dbConfig.dbconfig.password[0],
      database: dbConfig.dbconfig.database[0],
      port: dbConfig.dbconfig.port[0]
    });
    connection.connect(function(err) {
      if (err) {
        throw err;
      }
    });
    // currently just assuming only 1 unique account per username
    connection.query("SELECT * FROM tbl_accounts WHERE acc_login == 'user'", function(err, results, fields) {
      var hashed_pass = results[0].acc_password;
      var auth = function() {
        return bcrypt.compare(pass, hashed_pass, function(err, result) {
          return result;
        });
      }
      if (auth) {
        loggedin = true;
        res.redirect("/contacts");
      }
      else {
        console.log("Invalid Username or Password");
        loggedin = false;
        res.redirect("/login");
      }
    });
    connection.end();
  }
  else {
    res.send("Please enter Username and Password");
    // res.end();
  }
});

//TODO POST new contact entry from addContact form
app.post('/postContactEntry', urlencodedparser ,function(req, res) {
  var rowToBeInserted = {
    name: req.body.name,
    category: req.body.category,
    location: req.body.location,
    contact_info: req.body.contact,
    email: req.body.email,
    website: req.body.website_name,
    website_url: req.body.website_url
  };
  var connection = mysql.createConnection({
    host: dbConfig.dbconfig.host[0],
    user: dbConfig.dbconfig.user[0],
    password: dbConfig.dbconfig.password[0],
    database: dbConfig.dbconfig.database[0],
    port: dbConfig.dbconfig.port[0]
  });
  connection.connect(function(err) {
    if (err) {
      throw err;
    }
  });
  connection.query('INSERT tbl_contacts SET ?', rowToBeInserted, function(err, result) {
    if (err) {
      throw err;
    }
  });
  connection.end();
  res.redirect("/contacts");
});

// Makes Express use a router called utilities
app.use('/api', utilities);

// function to return the 404 message and error to client
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
    res.send();
});
