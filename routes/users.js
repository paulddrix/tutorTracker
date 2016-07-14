module.exports = (app) => {
  // const moment = require('moment');
  const handyUtils = require('handyutils');
  const userAccount = require('../models/account');
  /*
  USERS
  */
  app.get('/users', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /users', decodedInfo);
    userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
      const data = { userData: userResult[0], loggedIn: true };
      userAccount.find({}, (usersErr, UsersResult) => {
        data.users = UsersResult;
              // FIXME:add flash messages
              // if (app.locals.adminUsersErrorMessage) {
              //   data['adminUsersErrorMessage']= app.locals.adminUsersErrorMessage;
              // }
              // else if (app.locals.adminUsersSuccessMessage) {
              //   data['adminUsersSuccessMessage']= app.locals.adminUsersSuccessMessage;
              // }
        res.render('users', data);
      });
    });
  });
  /*
  USERS > PROFILE
  */
  app.get('/users/:userId', (req, res) => {
    // parsing idNumber to an integer
    const incomingNumber = parseInt(req.params.userId, 10);
    userAccount.find({ userId: incomingNumber }, (userErr, userResult) => {
      const data = { loggedIn: true };
      data.userProfile = userResult[0];
      res.render('userDetails', data);
    });
  });
  /*
  USERS > ADD USER PAGE
  */
  app.get('/users/create/user', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /users/create/user', decodedInfo);
    if (decodedInfo.admin === true) {
      userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
        const data = { userData: userResult[0], loggedIn: true };
        res.render('createUser', data);
      });
    } else {
      // send error with flash message
      res.redirect('/login');
    }
  });
  /*
  USERS > ADD USER HANDLER
  */
  app.post('/users/create/user/handler', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /users/create/handler', decodedInfo);
    if (decodedInfo.admin === true) {
      // check if the new user is an admin
      const userId = Math.floor((Math.random() * 99999999) + 10000000);
      const addID = parseInt(req.body.idNumber, 10);
      let addTxt;
      if (req.body.textAlert === 'true') {
        addTxt = true;
      } else {
        addTxt = false;
      }
      handyUtils.debug('REQ BODY at USERS > ADD USER HANDLER', req.body);
      const newUser = {};
      newUser.email = req.body.email;
      newUser.password = req.body.password;
      newUser.firstName = req.body.firstName;
      newUser.lastName = req.body.lastName;
      newUser.phone = req.body.phone;
      newUser.textAlert = addTxt;
      newUser.idNumber = addID;
      newUser.userId = userId;
      if (req.body.admin === 'true') {
        newUser.admin = true;
      } else {
        newUser.admin = false;
        newUser.monthlyTotalHours = 0;
        newUser.monthlyTotalShiftHours = 0;
        newUser.monthlyTotalSessionHours = 0;
        newUser.studentsToTutor = [];
        newUser.timeSheet = [];
        newUser.eligibleCourses = [];
        newUser.officeHours = [];
      }
      if (req.body.degree !== 'false') {
        newUser.degree = req.body.degree;
      }
      handyUtils.debug('NEWUSER at USERS > ADD USER HANDLER', newUser);
      userAccount.create(newUser, (userErr, userResult) => {
        // if (userErr !== null || userErr !== undefined) {
        //   app.locals.adminUsersErrorMessage ='There was an error adding a new user.';
        // }
        // if(userResult.result.ok === 1){
        //   app.locals.adminUsersSuccessMessage ='New user was successfully added.';
        // }
        res.redirect('/users');
      });
    } else {
      // send error with flash message
      res.redirect('/login');
    }
  });
  /*
  USERS > DELETE USER HANDLER
  */
  app.get('/users/destroy/user/handler/:userId', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('REQ PARAMS at /users/destroy/user/handler/:userId', req.params);
    const deleteUserId = parseInt(req.params.userId, 10);
    handyUtils.debug('decodedInfo at /users/destroy/user/handler/:userId', decodedInfo);
    if (decodedInfo.admin === true) {
      userAccount.destroy({ userId: deleteUserId }, (userErr, userResult) => {
            // if (userErr !== null || userErr !== undefined) {
            //   app.locals.adminUsersErrorMessage ='There was an error deleting the user.';
            // }
            // if(userResult.result.ok === 1){
            //   app.locals.adminUsersSuccessMessage ='User was successfully deleted.';
            // }
        res.redirect('/users');
      });
    } else {
      // send error with flash message
      res.redirect('/login');
    }
  });
  /*
  USERS > EDIT PAGE
  */
  app.get('/users/update/user/:userId', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    const editUserId = parseInt(req.params.userId, 10);
    handyUtils.debug('decodedInfo at /users/update/user/:userId', decodedInfo);
    if (decodedInfo.admin === true) {
      userAccount.find({ userId: editUserId }, (userErr, userResult) => {
        const data = { userData: userResult[0], loggedIn: true };
        res.render('updateUser', data);
      });
    } else {
      // send error with flash message
      res.redirect('/login');
    }
  });
  /*
  USERS > EDIT USER HANDLER
  */
  app.post('/users/update/user/handler', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /users/update/user/handler', decodedInfo);
    if (decodedInfo.admin === true) {
      const editIdNumber = parseInt(req.body.idNumber, 10);
      const editUserId = parseInt(req.body.userId, 10);
      let editTxt;
      let editAdmin;
      if (req.body.textAlert === 'true') {
        editTxt = true;
      } else {
        editTxt = false;
      }
      if (req.body.admin === 'true') {
        editAdmin = true;
      } else {
        editAdmin = false;
      }
      const editedUser = {};
      editedUser.email = req.body.email;
      editedUser.password = req.body.password;
      editedUser.firstName = req.body.firstName;
      editedUser.lastName = req.body.lastName;
      editedUser.phone = req.body.phone;
      editedUser.admin = editAdmin;
      editedUser.textAlert = editTxt;
      editedUser.idNumber = editIdNumber;
      if (req.body.degree !== false) {
        editedUser.degree = req.body.degree;
      }
      userAccount.update({ userId: editUserId }, editedUser, (updateErr, updateResult) => {
        // if (updateErr !== null || updateErr !== undefined) {
        //   app.locals.adminUsersErrorMessage ='There was an error editing the user.';
        // }
        // if (updateResult.result.ok === 1) {
        //   app.locals.adminUsersSuccessMessage ='User information was successfully edited.';
        // }
        res.redirect('/users');
      });
    } else {
      // send error with flash messages
      res.redirect('/login');
    }
  });
};
