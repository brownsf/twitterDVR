console.log("Server running at http://127.0.0.1:8000/");
// Load the http module to create an http server.
var express = require('express');
// Configure our HTTP server to respond with Hello World to all requests.
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var authController = require('./controllers/auth');
var userController = require('./controllers/user');
var userModel = require('./models/user');
var bodyParser = require('body-parser');

var session = require('express-session');
var twitterAPI = require('node-twitter-api');
var twitterController = require('./controllers/twitter');
global.jwtsecert = 'twtrdvr';
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
var twitter = new twitterAPI({
    consumerKey: 'pDXAozJtKBSet0GrEc5cFeQtI',
    consumerSecret: '4B5IqLqHT8pgPgeOThSAWtqTtbPBBarpr2o6j0SguSLfEV2Ote',
    callback: 'http://localhost:8080/twitter'
});
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

// Create our Express router
var router = express.Router();
// Connect to the twitterDVR MongoDB
mongoose.connect('mongodb://localhost:27017/twitterDVR');
// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
}));
var sess;
router.route('/users')
    .post(userController.postUsers)
    .get(userController.getUsers);
router.route('/users/:user_id')
    .put(userController.updateUser)
    .get(userController.getUser)
    .delete(userController.deleteUser);
router.route('/getOneUser').get(authController.isAuthenticated,userController.getOneUser);
router.route('/twitter_followers')
    .get(authController.isAuthenticated, twitterController.getFollowing)
    .post(authController.isAuthenticated, twitterController.postFollowing)
;
router.route('/twitter_followers/:cursor')
    .get(authController.isAuthenticated, twitterController.getFollowingNext)

;


app.get('/access', function (req, res) {
    sess = req.session;
    var user_id = req.query.user;
    twitter.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
        if (error) {
            console.log("Error getting OAuth request token : " + error);
        } else {
            //store token and tokenSecret somewhere, you'll need them later; redirect user
            sess.token = requestToken;
            sess.tokenSecret = requestTokenSecret;
            sess.user_id = user_id;
            sess.save();
            console.log(sess);
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + requestToken);
        }
    });
});


app.get('/twitter',  function (req, res) {
    sess = req.session;
    console.log(sess);
    var requestToken = sess.token;
    var requestTokenSecret = sess.tokenSecret;
    var user_id = sess.user_id;
    var oauth_verifier = req.param('oauth_verifier');

    twitter.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, function (error, accessToken, accessTokenSecret, results) {
        if (error) {
            console.log(error);
        } else {
            userController.twitterAuthSave(user_id, accessToken, accessTokenSecret);

            //Step 4: Verify Credentials belongs here
        }
    });
    res.redirect('/');
});
app.post('/authenticate', function (req, res) {
    console.log(req.params);
    console.log(req.body);
    var user = req.params.username ||req.body.username;

    var pass = req.params.password ||req.body.password;
    userModel.findOne({username: user}, function (err, user) {
        if (err) {
            console.log(err);
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {

                // Make sure the password is correct
                user.verifyPassword(pass, function (err, isMatch) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    // Password did not match
                    if (!isMatch) {
                        res.json({
                            type: false,
                            data: "Incorrect password"
                        });
                        return;
                    }
                    user.token = userController.getToken(user._id);

                    user.save(function(err,user) {
                        res.json({
                            type: true,
                            data: user,
                            token: user.token
                        })
                    });
                })
            } else {
                res.json({
                    type: false,
                    data: "Incorrect username"
                });
            }
        }

    });
});
app.use(express.static(__dirname + "/src"));
// Listen on port 8000, IP defaults to 127.0.0.1
app.use('/api', router);
var port = process.env.PORT || 80;
app.listen(port);

console.log('Magic happens on port 80');

exports = module.exports = app;
