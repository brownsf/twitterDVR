/**
 * Created by Scott on 12/30/2014.
 */

var User = require('../models/user');
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'pDXAozJtKBSet0GrEc5cFeQtI',
    consumerSecret: '4B5IqLqHT8pgPgeOThSAWtqTtbPBBarpr2o6j0SguSLfEV2Ote',
    callback: 'http://localhost:8080/twitter'
});
exports.getFollowing = function(req,res){
       twitter.friends("list", {
            skip_status: true,
            count:20
        },
        req.user.accessToken,
        req.user.accessTokenSecret,
        function(error, data, response) {
            if (error) {
                res.json(error);
            } else {
                res.json(data);
            }
        }
    );

}
exports.getFollowingNext = function(req,res){
    twitter.friends("list", {
            skip_status: true,
            count:20,
            cursor:req.params.cursor
        },
        req.user.accessToken,
        req.user.accessTokenSecret,
        function(error, data, response) {
            if (error) {
                res.json(error);
            } else {
                res.json(data);
            }
        }
    );

}
exports.postFollowing = function(req,res){


    User.findById(req.user._id, function(err,user){
        if (err)
            res.send(err);


        user.followList.push({followList:req.body.ids,begin:req.body.start,end:req.body.end});
        console.log(req.param('ids'));
        user.save(function(err,user){
            if (err) {
                res.send(err);
                return;
            }
            res.json({status:true, message: '' , data: user});

        })

    });


}