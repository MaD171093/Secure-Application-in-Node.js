var express = require('express');
var profileController = express.Router();
var bodyParser = require('body-parser');

var connectionDB = require('../utility/connectionDB.js');
var userDB = require('../utility/userDB.js');
var userConnectionDB = require('../utility/userConnectionDB.js');
var UserProfileModel = require('../models/userProfile.js');
var userConnection = require('../models/userConnection.js');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

var reqID;
var rsvp;
var userCoded;
var userProfile// keeps a track of user interaction during an active session
var user;//for displaying header according to the session
var userConnectionList;// stores userConnection objects
var reqIdList;//keeps a track of connectionIDs requested
var view;// for displaying header according to the session

var urlencodedParser = bodyParser.urlencoded({ extended: false });


//for displaying login screen
profileController.get('/login',function(req,res){
  if (req.session.theUser){view ="user"; user = req.session.theUser;}
  else{view = "general";}
  var msg = '';
  res.render('login',{view:view, user:user, msg:msg});
});


//for handling login requests
profileController.post('/savedConnections', urlencodedParser, [
  // username must be an email
  check('username','*Username must be email').trim().isEmail().normalizeEmail(),
  // password must be at least 5 chars long
  check('password').trim().isLength({ min: 5 }).withMessage('*Your password is atleast 5 characters long')
], function(req,res){
  var errors = validationResult(req);

  if (req.session.theUser) {
    res.redirect('savedConnections');
  }
  else{

    var uname = req.body.username;
    var pass = req.body.password;
    var boolUser = false;
    var userIndex;

    userDB.getUsers()
    .then(function(data){
      data.forEach(function(item){
        if(uname === item.username && pass === item.password){
          boolUser = true;
          userIndex = item.userID;
        }
        else if (uname === item.username) {
          boolUser = null;
        }
      });
      if(boolUser){
        // console.log("Success!!! logged in!!");
        view = "user";

        userConnectionList = []; // stores user's connection objects
        reqIdList = [];//keeps a track of connectionIDs requested

        //data of user from users collection
        userDB.getUser(userIndex)
        .then(function(userInfo){
          req.session.theUser = userInfo[0];
          user = req.session.theUser;
        })
        .catch(function(err){
          console.error("err", err);
        });

        userConnectionDB.getUserProfile(userIndex)
        .then(function(userCoded){
          userCoded.forEach(function(data){
            reqIdList.push(data.connectionID);
          });
        })
        .catch(function(err){
          console.error("err", err);
        });


        userConnectionDB.getUserConnections(userIndex)
        .then(function(data){
          // console.log("getUserConnections",data);
          data.forEach(function(d){
             userConnectionList.push({connection: d[0], rsvp: d[1]});
          });

          userProfile = new UserProfileModel(req.session.theUser.userID, userConnectionList);
          req.session.userConnection = userProfile.getConnections();

          // var userConnectionData = req.session.userConnection;
          // console.log("req.session.userConnection-2!!",req.session.userConnection);
          // console.log("userConnectionData",userConnectionData);

          res.render('savedConnections',{user:user, userConnectionData:req.session.userConnection, view:view});
        })
        .catch(function(err){
          console.error("err", err);
        });


      }
      else if (boolUser === null) {
        view = "general";
        if(!errors.isEmpty() && errors.mapped().password !== undefined){
          var msg = errors.mapped().password.msg;
        }
        else{
          var msg = '*Incorrect password, Try Again!';
        }
        res.render('login',{view:view, user:user, msg:msg});
      }
      else{
        view = "general";
        if(!errors.isEmpty() && errors.mapped().username !== undefined){
          var msg = errors.mapped().username.msg;
        }
        else{
          var msg = '*Username not registered, Try Again!';
        }
        res.render('login',{view:view, user:user, msg:msg});
      }
    });
  }
});

// this is activated when user clicks on login button
profileController.get('/savedConnections', function(req,res){
  view = "user";
  reqID = req.query.connectionID;
  rsvp =  req.query.rsvp;
  deleteConnectionID = req.query.deleteConnectionID;
  if(req.session.theUser){

    if(reqID != null){//this is used to solve issues with requests anytime the session is active but there is no query string!

      //Data from user interaction
       connectionDB.getConnection(reqID)
      .then(function(connectionObject){
        if (reqIdList.includes(reqID) === false){
          reqIdList.push(reqID);
          userProfile.addConnection(connectionObject[0], rsvp)
          req.session.userConnection = userProfile.getConnections();
          res.render('savedConnections',{user:req.session.theUser, userConnectionData:req.session.userConnection, view:view});

        }
        else{
          userProfile.updateConnection(connectionObject[0], rsvp)
          .then(function(){
            req.session.userConnection = userProfile.getConnections();
            res.render('savedConnections',{user:req.session.theUser, userConnectionData:req.session.userConnection, view:view});
          });

        }
      })
      .catch(function(err){
        console.error("err", err);
      });

    }
    else{
      res.render('savedConnections',{user:req.session.theUser, userConnectionData:req.session.userConnection, view:view});
    }

    if(deleteConnectionID != null){
      var indexReqId = reqIdList.indexOf(deleteConnectionID);
      reqIdList.splice(indexReqId,1);
      userProfile.removeConnection(deleteConnectionID);
      req.session.userConnection = userProfile.getConnections();
      res.render('savedConnections',{user:req.session.theUser, userConnectionData:req.session.userConnection, view:view});
    }

    // req.session.userConnection = userProfile.getConnections();
    // res.render('savedConnections',{user:req.session.theUser, userConnectionData:req.session.userConnection, view:view});

  }
  else{
    // to prevent direct access to saved connections by typing url.
    res.redirect('/login');
  }

});


//this is for log out
profileController.get('/savedConnections/clearSession', function(req,res){
  req.session.destroy(function(err) {
    if (err) {
      console.log("error deleting session");
    }
    userConnectionDB.userConnectionList = [];
    userProfile.emptyProfile();
    userProfile ='';
  });
  // userConnectionList = [];
  // reqIdList = [];
  // userProfile.emptyProfile();
  // console.log("Logout!! userProfile",userProfile.getConnections());

  res.redirect('../index');
});

profileController.get('/newConnection',function(req,res){
  if (req.session.theUser){view ="user"; user = req.session.theUser;}
  else{view = "general";}
  res.render('newConnection',{view:view, user:user, err:""});
});

module.exports = profileController;
