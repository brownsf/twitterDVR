console.log("Server running at http://127.0.0.1:8000/");
// Load the http module to create an http server.
var express = require('express');
// Configure our HTTP server to respond with Hello World to all requests.
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var authController = require('./controllers/auth');
var userController = require('./controllers/user');
var bodyParser = require('body-parser');
// Create our Express router
var router = express.Router();
// Connect to the twitterDVR MongoDB
mongoose.connect('mongodb://localhost:27017/twitterDVR');
// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
}));
router.route('/users')
    .post(userController.postUsers)
    .get(userController.getUsers);
router.route('/users/:user_id')
    .put(userController.updateUser)
    .get(userController.getUser)
    .delete(userController.deleteUser);

app.use(express.static(__dirname+"/src"));
// Listen on port 8000, IP defaults to 127.0.0.1
app.use('/api', router);
var port = process.env.PORT || 80;
app.listen(port);

console.log('Magic happens on port 80');

exports = module.exports = app;
