var jwt = require('jwt-simple');
var User = require('../models/user');
exports.isAuthenticated = function (req, res, next) {
  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

  if(token == 'undefined'){


    res.end('Access token has expired', 400);

  }
  console.log(token);
  if (token) {
    var decoded = jwt.decode(token, global.jwtsecert);
      if (decoded.exp <= Date.now()) {
          res.end('Access token has expired', 400);
      }
      User.findById(decoded.iss, function(err, user) {
        if(err)
          console.log(err);
        if(user) {

          if(user ==null){
            res.end('Access token has expired', 400);
          }

          req.user = user;
            next(null,user);
        }else{
          res.end('Access token has expired', 400);
        }
      });
  } else {
    next();
  }

}