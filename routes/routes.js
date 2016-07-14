module.exports = (app, publicKey, privateKey) => {
  // Route nomenclature as follows page/model/verb/target
  // example dashboard/account/tutoreligibility
  require('./auth')(app, publicKey, privateKey);
  require('./dashboard')(app);
  require('./officeHours')(app);
  require('./users')(app);
  require('./timeSheet')(app);
  require('./profile')(app);
  require('./helpSupport')(app);
};
