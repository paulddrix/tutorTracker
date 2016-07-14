module.exports = (app) => {
  const handyUtils = require('handyutils');
  const userAccount = require('../models/account');
  /*
  PROFILE
  */
  app.get('/profile', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /profile', decodedInfo);
    userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
      const data = { userData: userResult[0], loggedIn: true };
      // FIXME: add flash messages
      // if (app.locals.profileErrorMessage) {
      //   data['profileErrorMessage']= app.locals.profileErrorMessage;
      // }
      // else if (app.locals.profileSuccessMessage) {
      //   data['profileSuccessMessage']= app.locals.profileSuccessMessage;
      // }
      res.render('profile', data);
      // clear local vars
      // app.locals.profileErrorMessage = null;
      // app.locals.profileSuccessMessage = null;
    });
  });
  /*
  PROFILE > UPDATE
  */
  app.get('/profile/update/', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /profile/update/', decodedInfo);
    userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
      handyUtils.debug('update profile page', userResult[0]);
      const data = { userData: userResult[0], loggedIn: true };
      res.render('updateProfile', data);
    });
  });
  /*
  PROFILE UPDATE HANDLER
  */
  app.post('/profile/update/handler', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('req at /profile/update/handler', req.body);
    const editUserId = parseInt(req.body.userId, 10);
    handyUtils.debug('decodedInfo at /profile/update/handler', decodedInfo);
    let textAlert;
    if (req.body.textAlert === undefined) {
      textAlert = false;
    } else {
      textAlert = true;
    }
    const editedProfile = {};
    editedProfile.firstName = req.body.firstName;
    editedProfile.lastName = req.body.lastName;
    editedProfile.email = req.body.email;
    editedProfile.password = req.body.password;
    editedProfile.phone = req.body.phone;
    editedProfile.textAlert = textAlert;
    userAccount.update({ userId: editUserId }, editedProfile, (userErr, userResult) => {
      handyUtils.debug('result from update in editprofilehandler', userResult);
      // visual indication to the user so show an error
      // if (err !== null || err !== undefined ){
      // app.locals.profileErrorMessage ='Oops, there was an error editing your profile. ';
      // }
      // if(result.result.ok === 1){
      //   app.locals.profileSuccessMessage ='Profile information was successfully updated.';
      // }
      res.redirect('/profile');
    });
  });
};
