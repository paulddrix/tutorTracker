"use strict";
module.exports = function(app,publicKey,privateKey) {

  const
  moment = require('moment'),
  jwt = require('jsonwebtoken'),
  Utils = require('../lib/utils'),
  //Load models
  userAccount = require('../models/account'),
  courses = require('../models/courses'),
  tutorRequests = require('../models/tutorRequests'),
  officeHours = require('../models/officeHours');
  /*
  OFFICE HOURS
  */
  app.get('/officehours',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at officehours',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system" && decoded['admin'] === true){

          userAccount.getUser({userId:decoded.userId},function(result){
              var data={};
            data['userData'] = result[0];
            data['loggedIn'] = true;
            //current date
            var currentDate = moment().format("MM/DD/YYYY");
            // Get the current month based on today's date
            officeHours.getCurrentMonth(currentDate,function(currentMonth){
                   //get all the shifts for this month
                   officeHours.organizedShifts(currentMonth[0].startDate,currentMonth[0].endDate,function(officeShifts){
                       //parse shifts into a month object

                       var days = [];

                       for (let i = 0; i < officeShifts.length; i++) {
                          var weekDay={};
                          weekDay['dayName']= officeShifts[i]['_id'].dayName;
                          weekDay['dayDate']= officeShifts[i]['_id'].dayDate;
                          weekDay['humanReadbleDate']= officeShifts[i]['_id'].humanReadbleDate;
                          weekDay['10AM-1PM']=[];
                           weekDay['1PM-4PM']=[];
                           for (let x = 0; x < officeShifts[i].shifts.length; x++) {

                                  if(officeShifts[i].shifts[x].shift == '10AM-1PM'){
                                          weekDay['10AM-1PM'].push(officeShifts[i].shifts[x]);
                                  }
                                  if(officeShifts[i].shifts[x].shift == '1PM-4PM'){
                                          weekDay['1PM-4PM'].push(officeShifts[i].shifts[x]);
                                  }
                           }
                           //push the weekDay into the array of days
                            days.push(weekDay);
                       }

                      data['days'] = days;
                      Utils.debug('FINAL DAYS OBJECT',data['days']);

                      res.render('officeHours',data);

                   });

            });


          });
        }

        else if(decoded['iss'] === "system" && decoded['admin'] === false){

          userAccount.getUser({userId:decoded.userId},function(result){
            var data={};
            data['userData'] = result[0];
            data['loggedIn'] = true;
            res.render('officeHours',data);

          });
        }
      });
    }
  });
  /*
  OFFICE HOURS > ACCEPT SHIFT HANDLER
  */
  app.get('/acceptshift/:userId/:shiftId',function(req,res) {
      Utils.debug('REQ PARAMS at ACCEPT SHIFT HANDLER',req.params);

    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded jwt in DENY SHIFT HANDLER',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var tutorId = parseInt(req.params.userId);
          var officeShiftId = parseInt(req.params.shiftId);
          userAccount.updateArrayElement({userId:tutorId,"officeHours.shiftId":officeShiftId},
          {"officeHours.$.approved":true,"officeHours.$.pending":false},function(result){
            // FIXME: need to add the total of all shifts and place that in the totalShiftHours field for a tutor
            officeHours.updateOfficeHours({shiftId:officeShiftId},{"approved":true,"pending":false},function(){
              res.redirect('/officehours');
            });
          });
        }
      });
    }
  });
  /*
  OFFICE HOURS > DENY SHIFT HANDLER
  */
  app.get('/denyshift/:userId/:shiftId',function(req,res) {

      Utils.debug('REQ PARAMS at DENY SHIFT HANDLER',req.params);

    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('REQ PARAMS at DENY SHIFT HANDLER',req.params);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var tutorId = parseInt(req.params.userId);
          var officeShiftId = parseInt(req.params.shiftId);
          // FIXME: add the total office hours again after the shift has been removed from the array
          userAccount.pullFromArray({userId:tutorId},{ "officeHours": { shiftId: officeShiftId } },function(result){
            officeHours.destroyShift({shiftId:officeShiftId},function(result){
              res.redirect('/officehours');
            });
          });
        }
      });
    }
  });
  /*
  OFFICE HOURS > REMOVE SHIFT HANDLER
  */
  app.get('/removeshift/:userId/:shiftId',function(req,res) {

      Utils.debug('REQ PARAMS at REMOVE SHIFT HANDLER',req.params);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT in DENY SHIFT HANDLER',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var tutorId = parseInt(req.params.userId);
          var officeShiftId = parseInt(req.params.shiftId);
          userAccount.pullFromArray({userId:tutorId},{ "officeHours": { shiftId: officeShiftId } },function(result){
            officeHours.destroyShift({shiftId:officeShiftId},function(result){
              res.redirect('/officehours');
            });
          });
        }
      });
    }
  });

  /*
  OFFICE HOURS > REQUEST SHIFT
  */
  app.get('/officehours/requestshift',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT in REQUEST SHIFT',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('requestShift',data);
          });
        }
      });
    }
  });
  /*
  OFFICE HOURS > REQUEST SHIFT HANDLER
  */
  app.post('/requesthandler',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT in REQUEST SHIFT HANDLER',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){

          var shiftDate = moment(req.body.shiftDate).format("MM/DD/YYYY");
          var shiftDateHumanFormat = moment(req.body.shiftDate).format("dddd, MMMM Do YYYY");
          var shiftDay = moment(req.body.shiftDate).format("dddd");
          var shiftId = Math.floor((Math.random() * 99999999) + 10000000);
          var newShift = {
                    "dayName" : shiftDay,
                    "shiftId":shiftId,
                    "dayDate" :shiftDate ,
                    "humanReadbleDate":shiftDateHumanFormat,
                    "shift" : req.body.shift,
                    "tutorName" : req.body.tutorName,
                    "shiftHours" : 3,
                    "userId" : parseInt(req.body.userId),
                    "pending" : true,
                    "approved" : false
           };
          officeHours.createShift(newShift,function(results){
            //send the request to the tutor's office hours array
            userAccount.addToArray({userId:parseInt(req.body.userId)},{"officeHours":newShift},function(result){

              Utils.debug('result from addToArray ReqSHiftHandler',result);
              res.redirect('/officehours');
            });
          });

        }
      });
    }
  });
}
