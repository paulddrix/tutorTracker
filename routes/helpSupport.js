"use strict";
module.exports = function(app,publicKey,privateKey) {

  const jwt = require('jsonwebtoken'),
  Utils = require('../lib/utils'),
  userAccount = require('../models/account');

  /*
  HELP & SUPORT
  */
  app.get('/helpSupport',function(req,res) {
    if(req.cookies.auth != undefined){
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at helpSupport',decoded);
        if(decoded == undefined){
          res.render('helpSupport');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(err,result){
            var userInfo = {userData:result[0],loggedIn:true};
            userAccount.getUsers({},function(err,results) {
              userInfo['users']=results;
              res.render('helpSupport',userInfo);
            });
          });
        }
      });
    }
    else{
      res.render('helpSupport');
    }
  });
   /*
  HELP & SUPORT > FAQ
  */
  app.get('/helpSupport/faq',function(req,res) {

    if(req.cookies.auth != undefined){
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at helpSupport FAQ',decoded);
        if(decoded == undefined){
          res.render('faq');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(err,result){
            var userInfo = {userData:result[0],loggedIn:true};
            userAccount.getUsers({},function(err,results) {
              userInfo['users']=results;
              res.render('faq',userInfo);
            });
          });
        }
      });
    }
    else{
      res.render('faq');
    }
  });
}//end of export
