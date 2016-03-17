"use strict";
module.exports = function(app,publicKey,privateKey) {

  const jwt = require('jsonwebtoken'),
  moment = require('moment'),
  Utils = require('../lib/utils'),
  userAccount = require('../models/account');


  /*
  TIME SHEET
  */
  app.get('/timesheet',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT in timesheet',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            userAccount.getUsers({admin:false},function(results) {
              data['users']=results;
              res.render('timeSheet',data);
            });
          });
        }
      });
    }
  });
  /*
  TIME SHEET > TUTOS TIME SHEET DETAILS
  */
  app.get('/timesheet/tutortimesheetdetails/:userId',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at TUTOS TIME SHEET DETAILS',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            var userID = parseInt(req.params.userId);
            userAccount.getUser({userId:userID},function(results) {
              data['tutor']=results[0];
              res.render('timeSheetDetails',data);
            });
          });
        }
      });
    }
  });
  /*
  TIME SHEET > ADD SESSION PAGE
  */
  app.get('/timesheet/addsession',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at TIME SHEET > ADD SESSION PAGE',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('addSession',data);
          });
        }
      });
    }
  });
  /*
  TIME SHEET > ADD SESSION HANDLER
  */
  app.post('/timesheet/addsessionhandler',function(req,res){

    Utils.debug('REQ BODY at TIME SHEET > ADD SESSION HANDLER',req.body);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at TIME SHEET > ADD SESSION HANDLER',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var sessionUserId = parseInt(req.body.userId);
          var startTime = moment(req.body.sessionDate + " " + req.body.sessionStartTime);
          var endTime = moment(req.body.sessionDate + " " + req.body.sessionEndTime);
          var totalHours = endTime.diff(startTime,'minutes')/60;
          var sessionDate = moment(req.body.sessionDate).format("MM/DD/YYYY");
          var sessionData = {
            "sessionDate" :sessionDate ,
            "sessionStartTime" : startTime.format('h:mm A'),
            "sessionEndTime" : endTime.format('h:mm A'),
            "sessionTotal":totalHours
          };
          userAccount.addToArray({ userId:sessionUserId},{timeSheet:sessionData},function(result){
            //add the session to the timeSheet array.
            userAccount.sumStdSessions(sessionUserId,function(sumRes) {
              //sum up all the session hour totals

              Utils.debug('SUM OF STUDENT SESSIONS',sumRes);

              Utils.debug('TOTLA SUM OF STUDENT SESSIONS',sumRes[0].total);
              userAccount.updateUser({userId:sessionUserId},{monthlyTotalSessionHours:sumRes[0].total},function(result) {
                //insert the total in the tutor's monthlyTotalSessionHours.
                //FIX ME: how to make the monthlyTotalHours always add the values
                //for monthlyTotalSessionHours and monthlyTotalShiftHours
                //userAccount.updateUser({userId:sessionUserId},,function(result) {
                //add the monthlyTotalSessionHours to the tutor's monthlyTotalHours
                //Utils.debug('some result',result);
                res.redirect('/timesheet');
                //});
              });
            });
          });
          // do aggregate func to get the sum of all the sessions and add them tp the tutor's total.
        }
      });
    }
  });
}//end of export
