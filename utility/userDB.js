var user = require('../models/user.js');
// var userConnection = require('../models/userConnection.js');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ArchitectureSociety', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

var userList = [];
var userDetailsList =[];
// var userData = [{
//   _id:"u1",
//   fn: "Manoj",
//   ln: "Deshpande",
//   em:"mdeshpa4@uncc.edu",
//   add1:"9535 UTD",
//   add2:"Apt-B",
//   city:"Charlotte",
//   state:"North Carolina",
//   zip:"28262",
//   country:"United States",
//   conn:[[connectionDB.getConnection('03_flw_club')[0],'maybe'],[connectionDB.getConnection('01_flw_club')[0] ,'yes']]
// },
// {
//   _id:"u2",
//   fn: "MaD",
//   ln: "TechIntegrator",
//   em:"MaD@uncc.edu",
//   add1:"9875 UTD",
//   add2:"Apt-C",
//   city:"Charlotte",
//   state:"North Carolina",
//   zip:"28262",
//   country:"United States",
//   conn:[[connectionDB.getConnection('02_flw_club')[0], 'yes'],[connectionDB.getConnection('03_am_club')[0],'maybe']],
// }];


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('Connected to the database from userDB!');

  // user.find(async function (err, users) {
  //   if (err) return console.error(err);
  //   // console.log("users",users);
  //   userList = await users;
  //
  //   });
});


//returns user objects as a list
var getUsers = async function(){
  return await user.find({});;
}

//for getting a specific user object with a particular  userID
var getUser = async function(userID){
  userDetailsList = await user.find({ userID: userID });
  return userDetailsList;
}



module.exports.getUsers = getUsers;
module.exports.getUser = getUser;
