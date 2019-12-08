var userConnection = require('../models/userConnection.js');
var connectionDB = require('../utility/connectionDB.js');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ArchitectureSociety', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

var userConnectionList;
var userConnectionDetailsList;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('Connected to the database from userConnectionDB!');

  // userConnection.find(async function (err, userConnections) {
  //   if (err) return console.error(err);
  //   // console.log("userConnections",userConnections);
  //   userConnectionList = await userConnections;
  //   // userConnections.forEach(makeUserConnectionObject);
  //
  //   });
});


//returns user connection objects as a list
var getUserConnections = async function(userID){
  userConnectionList = [];
  userConnectionDetailsList =[];

  userConnectionDetailsList = await userConnection.find({ userID: userID });
  // console.log("userConnectionDetailsList",userConnectionDetailsList);

  await asyncForEach(userConnectionDetailsList, async function(data){
    var conn = await connectionDB.getConnection(data.connectionID);
    await userConnectionList.push([conn[0], data.rsvp]);
  });

  return  userConnectionList;
}


//for getting a specific user connection object with a particular  userID
var getUserProfile = async function(userID){
  userConnectionDetailsList =[];

  userConnectionDetailsList = await userConnection.find({ userID: userID });
  return userConnectionDetailsList;
}

var addRSVP = async function(userID,connectionID, rsvp){

  var data = new userConnection({userID: userID, connectionID: connectionID, rsvp: rsvp});
  await data.save(function (err) {
    if (err) return console.error(err);
  });

}

var deleteConnection = async function(connectionID, userID){
  await userConnection.deleteOne({ connectionID: connectionID,userID: userID  }, function (err) {
    if (err) return console.error(err);
  });
}

var updateRSVP = async function(userID,connectionID, rsvp){
  await userConnection.findOneAndUpdate(
    {userID: userID, connectionID: connectionID},
    {rsvp: rsvp},
    {new:true},function (err) {
      if (err) return console.error(err);
  });

}

//asyncForEach - source:
//https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(list, callback) {
  for (let index = 0; index < list.length; index++) {
    await callback(list[index], index, list);
  }
}

module.exports.getUserConnections = getUserConnections;
module.exports.getUserProfile = getUserProfile;
module.exports.addRSVP = addRSVP;
module.exports.updateRSVP = updateRSVP;
module.exports.deleteConnection= deleteConnection;
