// Load required packages
var User = require('../models/user');
var passport = require('passport');
var moment = require('moment');
var jwt = require('jwt-simple');
// Create endpoint /api/users for POST
exports.postUsers = function (req, res) {
    User.findOne({email: req.body.username}, function (err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.username = req.body.username;
                userModel.password = req.body.password;
                userModel.save(function (err, user) {
                    if(err)
                        res.json(err);

                    var token = this.getToken(user._id);
                    userModel.token = token;


                    user.save(function (err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    });
}
// Create endpoint /api/users for GET
exports.getUsers = function (req, res) {
    User.find(function (err, users) {
        if (err)
            res.send(err);

        res.json(users);
    });
};

exports.getUser = function (req, res) {

    User.findOne(req.body.username, function (err, user) {
        if (err)
            res.send(err);

        res.json({status: true, message: '', data: user});

    });


};

exports.updateUser = function (req, res) {

    User.findById(req.params.user_id, function (err, user) {
        if (err)
            res.send(err);
        user.save(function (err, user) {
            if (err)
                res.send(err);

            res.json({status: true, message: 'Updated!', data: user});
        });
    });
};

exports.twitterAuthSave = function (user_id, token, secret) {

    User.findById(user_id, function (err, user) {
        if (err)
            res.send(err);
        user.accessToken = token;
        user.accessTokenSecret = secret;

        user.save(function (err, user) {
            if (err)
                console.log(err)


        });
    });
}

exports.getOneUser = function(req,res){

    User.findById(req.user._id, function (err, user) {
        if (err)
            res.send(err);

        res.json({status: true, data: user});
    });

}

exports.deleteUser = function (req, res) {
    // Use the Beer model to find a specific beer and remove it
    User.findByIdAndRemove(req.params.user_id, function (err) {
        if (err)
            res.send(err);

        res.json({message: 'Beer removed from the locker!'});
    });
};

exports.getToken=function(user_id){

    var expires = moment().add(7,'days').valueOf();
    var token = jwt.encode({
        iss: user_id,
        exp: expires
    }, global.jwtsecert);
    return token;
}
