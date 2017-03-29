var crypto = require('crypto');
var path = require('path');
var express = require('express')
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var Datastore = require('nedb');

var users = new Datastore({ filename: 'db/users.db', autoload: true, timestampData: true});

//var mongoServer = 'mongo';

// Database
//var mongo = require('mongodb').MongoClient;
//var monk = require('monk');
//var mongoose = require('mongoose');
//var users;

//mongo.connect('mongodb://' + mongoServer + ':27017/test', function(err, db) {
    //if (err) return console.log(err);
    //console.log("Mongo database connected");
    //users = db.collection('test');
//});

// var db = monk('localhost:27017/usersDb');
// var users = db.get('usersDb');


//var Datastore = require('nedb');
//var users = new Datastore({ filename: 'db/users.db', autoload: true, timestampData: true});

// User constructor
var User = function(user){
    var salt = crypto.randomBytes(16).toString('base64');
    var hash = crypto.createHmac('sha512', salt);
    hash.update(user.password);
    this.username = user.username;
    this.salt = salt;
    this.saltedHash = hash.digest('base64');
    this.friends = [];
    this.picture = null;
    this.peerId = null;
    this.status = "Offline";
};


// Authentication

var checkPassword = function(user, password){
        var hash = crypto.createHmac('sha512', user.salt);
        hash.update(password);
        var value = hash.digest('base64');
        return (user.saltedHash === value);
};

var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

// serving the frontend

app.get('/', function (req, res, next) {
    if (!req.session.user) return res.redirect('/signin.html');
    return next();
});

app.get('/profile.html', function (req, res, next) {
    if (!req.session.user) return res.redirect('/signin.html');
    return next();
});

app.get('/signout/', function (req, res, next) {
    users.update({username: req.session.user.username}, {$set: {status: "Offline"}}, {multi:false}, function (err, n) {
        if (err) return res.status(404).end("User username:" + req.session.user.username + " does not exists");
    });
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.redirect('/signin.html');
    });
});

app.use(express.static('frontend'));

// signout, signin

app.get('/api/signout/', function (req, res, next) {
    users.update({username: req.session.user.username}, {$set: {status: "Offline"}}, {multi:false}, function (err, n) {
        if (err) return res.status(404).end("User username:" + req.session.user.username + " does not exists");
    });
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.end();
    });
});

app.post('/api/signin/', function (req, res, next) {
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    users.update({username: req.body.username}, {$set: {status: "Online"}}, {multi:false}, function (err, n) {
        if (err) return res.status(404).end("User username:" + req.session.user.username + " does not exists");
    }); 
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user || !checkPassword(user, req.body.password)) return res.status(401).end("Unauthorized");
        req.session.user = user;
        res.cookie('username', user.username);
        return res.json(user);
    });
});

// Create
app.put('/api/users/', function (req, res, next) {
    var data = new User(req.body);
    users.findOne({username: req.body.username}, function (err, user) {
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("Username " + req.body.username + " already exists");
        users.insert(data, function (err, user) {
            if (err) return res.status(500).end(err);
            return res.json(user);
        });
    });
});

// Read
app.get('/api/users/:username/picture/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    users.findOne({username: req.params.username}, function(err, user){
        if (err) return res.status(404).end("User username:" + req.params.username + " does not exists");
        if (user.picture){
            res.setHeader('Content-Type', user.picture.mimetype);
            return res.sendFile(path.join(__dirname, user.picture.path));
        }
        return res.redirect('/media/user.png');
    });    
});

app.get('/api/friends/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    users.findOne({username: req.session.user.username}, function (err, user) {
        var selectedIds = user.friends;
        var ids = selectedIds.map(function(e){return {_id: e};});
        users.find({ $or: ids}, function(err, selectedFriends) {
            selectedFriends.forEach(function(e) {
                if (e.picture) {
                    e.mimetype = e.picture.mimetype;
                }
                e.picture = "/api/users/" + e.username + "/picture/";
                return e;
            });
            return res.json(selectedFriends);
        });   
    });
});

app.get('/api/users/:username/', function(req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    users.findOne({username: req.params.username}, function(err, e) {
        if (err) return res.status(404).end("Player username:" + req.params.username + " does not exists");
        console.log(e);
        //var user = users.find(function(u) {return u.username === e.username;});
        if (e.picture) {
            e.mimetype = e.picture.mimetype;
        }
        e.picture = "/api/users/" + e.username + "/picture";
        return res.json([e]);
    });
});

// Update
app.patch('/api/users/:username/', upload.single('picture'), function (req, res, next) {
     if (req.params.username !== req.session.user.username) return res.status(403).send("Forbidden");
     users.update({username: req.params.username}, {$set: {picture: req.file}}, {multi:false}, function (err, n) {
         if (err) return res.status(404).end("User username:" + req.params.username + " does not exists");
         return res.json("");
     });        
});

app.patch('/api/addFriend/:id/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var data = {};
    data["friends"] = req.params.id;
    users.update({username: req.session.user.username}, {$push: data}, {multi: false}, function (err, n) {
        return res.json("");
    });
});

app.patch('/api/deleteFriend/:id/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var data = {};
    data["friends"] = req.params.id;
    users.update({username: req.session.user.username}, {$pull: data}, {multi: false}, function (err, n) {
        return res.json("");
    }); 
});

app.patch('/api/newId/:id/', function (req, res, next) {
    users.update({username: req.session.user.username}, {$set: {peerId: req.params.id}}, {}, function(err, n) {
        if (err) return res.status(404).end("Not found");
    });
    //console.log(users.getAllData());
    return res.json("");
});

// Delete

var options = {
    debug: true
}

var PeerServer = require('peer').PeerServer;

var custom_server = PeerServer({
  port: 9000,
  path:"/peerjs"
});

var http = require('http');

http.createServer(app).listen(3000, function () {
    console.log('HTTP on port 3000');
});
