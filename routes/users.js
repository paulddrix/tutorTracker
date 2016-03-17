"use strict";
module.exports = function(app,publicKey,privateKey) {
  const
  moment = require('moment'),
  jwt = require('jsonwebtoken'),
  Utils = require('../lib/utils'),
  //Load models
  userAccount = require('../models/account');
  /*
  USERS
  */
  app.get('/users',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at USERS',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            userAccount.getUsers({},function(results) {
              data['users']=results;
              res.render('users',data);
            });
          });
        }
      });
    }
  });
  /*
  USERS > PROFILE
  */
  app.get('/users/userprofiles/:userId',function(req,res) {
    //making idNumber an integer
    var incomingNumber = parseInt(req.params.userId);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at USERS > PROFILE',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:incomingNumber},function(result) {
            var data={loggedIn:true};
            data['userProfile']=result[0];
            res.render('userDetails',data);
          });
        }
      });
    }
  });
  /*
  USERS > ADD PAGE
  */
  app.get('/users/adduser',function(req,res){
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at USERS > ADD PAGE',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system" && decoded['admin'] == true){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('addUser',data);
          });
        }
      });
    }
  });
  /*
  USERS > ADD USER HANDLER
  */
  app.post('/adduserhandler',function(req,res){
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at USERS > ADD USER HANDLER',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          //check if the new user is an admin
          var userId = Math.floor((Math.random() * 99999999) + 10000000);
          var addID = parseInt(req.body.idNumber);
          var addTxt;
          if(req.body.textAlert == 'true'){
            addTxt= true;
          }
          else{
            addTxt= false;
          }

          Utils.debug('REQ BODY at USERS > ADD USER HANDLER',req.body);
          var newUser = {
            "email" : req.body.email,
            "password" : req.body.password,
            "firstName" : req.body.firstName,
            "lastName":req.body.lastName,
            "phone" : req.body.phone,
            "textAlert":addTxt,
            "idNumber":addID,
            "userId":userId
          };
          if (req.body.admin == 'true') {
            newUser['admin']= true;
          }
          else{
            newUser["admin"]= false;
            newUser["monthlyTotalHours"]= 0,
            newUser["monthlyTotalShiftHours"]= 0,
            newUser["monthlyTotalSessionHours"]=0,
            newUser["studentsToTutor"]=[];
            newUser["timeSheet"]=[];
            newUser["eligibleCourses"]=[];
            newUser["officeHours"]=[];
          }
          if (req.body.degree != 'false') {
            newUser['degree']= req.body.degree;
          }

          Utils.debug('NEWUSER at USERS > ADD USER HANDLER',newUser);
          userAccount.createUser(newUser,function(result, err){
            res.redirect('/users');
          });
        }
      });
    }
  });
  /*
  USERS > DELETE USER HANDLER
  */
  app.get('/users/deleteuserhandler/:userId',function(req,res){

    Utils.debug('REQ PARAMS at USERS > DELETE USER HANDLER',req.params);
    var deleteUserId = parseInt(req.params.userId);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at USERS > DELETE USER HANDLER',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.destroyUser({userId:deleteUserId},function(result,err) {
            res.redirect("/users");
          });
        }
      });
    }
  });
  /*
  USERS > EDIT PAGE
  */
  app.get('/users/edituser/:userId',function(req,res){
    var editUserId= parseInt(req.params.userId);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at USERS > EDIT PAGE',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:editUserId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('editUser',data);
          });
        }
      });
    }
  });
  /*
  USERS > EDIT USER HANDLER
  */
  app.post('/edituserhandler',function(req,res){
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at USERS > EDIT USER HANDLER',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var editIdNumber = parseInt(req.body.idNumber);
          var editUserId = parseInt(req.body.userId);
          var editTxt;
          var editAdmin;
          if(req.body.textAlert === 'true'){
            editTxt= true;
          }
          else{
            editTxt= false;
          }
          if(req.body.admin === 'true'){
            editAdmin= true;
          }
          else{
            editAdmin= false;
          }
          var editedUser = {
            "email" : req.body.email,
            "password" : req.body.password,
            "firstName" : req.body.firstName,
            "lastName":req.body.lastName,
            "phone" : req.body.phone,
            "admin" : editAdmin,
            "textAlert":editTxt,
            "idNumber":editIdNumber
          };
          if (req.body.degree !=false) {
            editedUser['degree']= req.body.degree;
          }
          userAccount.updateUser({ userId:editUserId},editedUser,function(result){
            res.redirect('/users');
          });
        }
      });
    }
  });

}//end of export
