"use strict";
module.exports = function(app,publicKey,privateKey) {
  // Route nomenclature as follows page/model/verb/target
  //example dashboard/account/tutoreligibility
  const Auth = require('./auth')(app,publicKey,privateKey);
  const Dashboard = require('./dashboard')(app,publicKey,privateKey);
  const OfficeHours = require('./officeHours')(app,publicKey,privateKey);
  const Users = require('./users')(app,publicKey,privateKey);
  const TimeSheet = require('./timeSheet')(app,publicKey,privateKey);
  const Profile = require('./profile')(app,publicKey,privateKey);
  const HelpSupport = require('./helpSupport')(app,publicKey,privateKey);
}
