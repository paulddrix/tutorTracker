"use strict";
module.exports = function(app,publicKey,privateKey) {

  const jwt = require('jsonwebtoken'),
  Utils = require('../lib/utils'),
  userAccount = require('../models/account');

  /*
  PROFILE
  */
  app.get('/profile',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at PROFILE',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(err,result){
            var data = {userData:result[0],loggedIn:true};
            if (app.locals.profileErrorMessage) {
              data['profileErrorMessage']= app.locals.profileErrorMessage;
            }
            else if (app.locals.profileSuccessMessage) {
              data['profileSuccessMessage']= app.locals.profileSuccessMessage;
            }
            res.render('profile',data);
            //clear local vars
            app.locals.profileErrorMessage = null;
            app.locals.profileSuccessMessage = null;

          });
        }
      });
    }
  });
  /*
  EDIT PROFILE
  */
  app.get('/profile/editprofile',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at EDIT PROFILE',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(err,result){

            Utils.debug('edit profile page',result[0]);
            var data = {userData:result[0],loggedIn:true};
            res.render('editProfile',data);
          });
        }
      });
    }
  });
  /*
  HANDLE EDIT PROFILE
  */
  app.post('/editprofilehandler',function(req,res) {

    Utils.debug('edit request ***** ',req.body);
    var editUserId = parseInt(req.body.userId);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT in HANDLE EDIT PROFILE',req.body);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          if (req.body.textAlert === undefined) {
            var textAlert = false;
          }
          else{
            var textAlert = true;
          }
          var editedProfile = {
            "firstName":req.body.firstName,
            "lastName":req.body.lastName,
            "email":req.body.email,
            "password":req.body.password,
            "phone":req.body.phone,
            "textAlert":textAlert
          };
          userAccount.updateUser({ userId:editUserId },editedProfile,function(err,result){

            Utils.debug('result from update in editprofilehandler',result);
            // visual indication to the user so show an error
            if(err != null || err != undefined){
              app.locals.profileErrorMessage ='Oops, there was an error editing your profile. ';
            }
            if(result.result.ok === 1){
              app.locals.profileSuccessMessage ='Profile information was successfully updated.';
            }
            res.redirect('profile');
          });
        }
      });
    }
  });
}//end of export
