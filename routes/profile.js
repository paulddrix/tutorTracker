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
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('profile',data);
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
          userAccount.getUser({userId:decoded.userId},function(result){

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
          userAccount.updateUser({ userId:editUserId },editedProfile,function(result){

            Utils.debug('result from update in editprofilehandler',result);
            res.redirect('profile');
          });
        }
      });
    }
  });
}//end of export
