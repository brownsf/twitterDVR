// Load required packages
var User = require('../models/user');

// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });

  user.save(function(err,user) {
    if (err)
      res.send(err);

    res.json({status:true, message: 'New user added!',data:{id:user._id} });
  });
};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
};

exports.getUser = function(req, res){

  User.findById(req.params.user_id, function(err,user){
    if (err)
      res.send(err);

    res.json({status:true, message: '' , data: user});

  });


};

exports.updateUser = function(req, res){

  User.findById(req.params.user_id, function(err,user){
    if (err)
      res.send(err);

    user.save(function(err,user) {
      if (err)
        res.send(err);

      res.json({status:true, message: 'Updated!',data: user });
    });



  });


};

exports.deleteUser = function(req, res) {
  // Use the Beer model to find a specific beer and remove it
  User.findByIdAndRemove(req.params.user_id, function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Beer removed from the locker!' });
  });
};
