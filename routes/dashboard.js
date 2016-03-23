"use strict";
module.exports = function(app,publicKey,privateKey) {

  const
  moment = require('moment'),
  jwt = require('jsonwebtoken'),
  Utils = require('../lib/utils'),
  exec = require('child_process').exec,
  // Load models
  userAccount = require('../models/account'),
  courses = require('../models/courses'),
  tutorRequests = require('../models/tutorRequests');
  /*
  DASHBOARD
  */
  app.get('/dashboard',function(req,res) {
    //Utils.debug('AUTH MIDDLEWARE TEST ',req.typeOfAdmin);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){
        Utils.debug('decoded jwt in DASHBOARD Route',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        //if the user is an admin
        else if(decoded['iss'] === "system" && decoded['admin'] === true){
          Utils.debug('DASHBOARD Route ADMIN conditial','ADMIN!!!!');
          var data = {userData:{admin:true},loggedIn:true};
          userAccount.getUsers({admin:false},function(err,results) {
            data['tutorList']=results;
            courses.getCourses({},function(err,courseRes) {
              data['courseList']=courseRes;
              tutorRequests.getTutorRequests({rejected:true},function(err,rejectedDocs){
                data['rejectedDocs'] = rejectedDocs;
                Utils.debug('DASHBOARD Route ADMIN conditial DATA!',data);
                if (app.locals.adminDashErrorMessage) {
                  data['adminDashErrorMessage']= app.locals.adminDashErrorMessage;
                }
                else if (app.locals.adminDashSuccessMessage) {
                  data['adminDashSuccessMessage']= app.locals.adminDashSuccessMessage;
                }
                res.render('dashboard',data);
                //clear local vars
                app.locals.adminDashErrorMessage = null;
                app.locals.adminDashSuccessMessage = null;
              });
            });
          });
        }
        //if the user is a tutor
        else if(decoded['iss'] === "system" && decoded['admin'] === false){
          Utils.debug('DASHBOARD Route TUTOR conditial','TUTOR!!!!');
          userAccount.getUser({userId:decoded.userId},function(err,result){
            var data = {userData:result[0],loggedIn:true};
            Utils.debug('DASHBOARD Route TUTOR conditial DATA!',data);
            if (app.locals.tutorDashErrorMessage) {
              data['tutorDashErrorMessage']= app.locals.tutorDashErrorMessage;
            }
            else if (app.locals.tutorDashSuccessMessage) {
              data['tutorDashSuccessMessage']= app.locals.tutorDashSuccessMessage;
            }
            res.render('dashboard',data);
            //clear local vars
            app.locals.tutorDashErrorMessage = null;
            app.locals.tutorDashSuccessMessage = null;
          });
        }
      });
    }
  });
  /*
  DASHBOARD > SEARCH TUTOR ELIGIBILITY
  */
  app.get('/tutoreligibility/:coursename',function(req,res){
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded jwt in DASHBOARD Route',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        //if the user is an admin
        else if(decoded['iss'] === "system" && decoded['admin'] === true){
          userAccount.getUsers({"eligibleCourses.courseName": req.params.coursename},function(err,doc) {
            res.send(doc);
          });
        }
        //if the user is a tutor
        else{
          res.redirect('/login');
        }
      });
    }
  });
  /*
  DASHBOARD > ADD TUTOR REQUEST HANDLER
  */
  app.post('/addtutorrequesthandler', function(req,res) {
    Utils.debug('req body in ADD TUTOR REQUEST HANDLER',req.body);


    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded jwt at addtutorrequesthandler',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          let assignedTutor = parseInt(req.body.assignTutor);
          let requestId = Math.floor((Math.random() * 99999999) + 10000000);
          let dateAdded = moment().format("dddd, MMMM Do YYYY, h:mm a");
          let newTutorRequest = {
            "dateAdded":dateAdded,
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "email": req.body.email,
            "phone": req.body.phone,
            "degree": req.body.degree,
            "courseToTutor": req.body.courseToTutor,
            "program": req.body.program,
            "assignTutor": assignedTutor,
            "requestId":requestId,
            "pendingStatus":true
          };
          tutorRequests.createRequest(newTutorRequest,function(err,result){
            Utils.debug('error in creating tutor request ',err);
            // visual indication to the user so show an error
            if(err != null || err != undefined){
              app.locals.errorMessage = ' There was an error creating the tutor request';
            }

          });
          userAccount.addToArray({userId:assignedTutor},{studentsToTutor:newTutorRequest},function(err,result){
            Utils.debug('error in adding tutor request to assigned tutor',err);
            // visual indication to the user so show an error
            if(err != null || err != undefined){
              app.locals.adminDashErrorMessage ='There was an error assigning the request to the tutor.';
            }
            if(result.result.ok === 1){
              app.locals.adminDashSuccessMessage ='Tutor request was successfully added.';
            }
            // txt tutor
            exec('curl -Xcurl -X POST http://textbelt.com/text -d number=9043074738 -d \"message=There is a new tutor request for you, please log into Tutor Tracker and address it, Thank you.\"');
            res.redirect('/dashboard');
          });


        }
      });
    }
  });
  /*
  DASHBOARD > VIEW TUTOR REQUEST
  */
  app.get('/dashboard/tutorrequest/:requestid',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded jwt in VIEW TUTOR REQUEST',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        //if the user is an admin
        else if(decoded['iss'] === "system" && decoded['admin'] === true){
          userAccount.getUser({userId:decoded['userId']},function(err,result){
            var data = {userData:result[0],loggedIn:true};
            var incomingRequestId = parseInt(req.params.requestid);
            tutorRequests.getTutorRequests({requestId:incomingRequestId},function(err,request){
              data['tutorRequest'] = request[0];

              userAccount.getUsers({admin:false},function(err,results) {
                data['tutorList']=results;
                courses.getCourses({},function(err,courseRes) {
                  data['courseList']=courseRes;
                  res.render('tutorRequestDetails',data);
                });
              });
            });
          });
        }
        else if (decoded['iss'] === "system" && decoded['admin'] === false) {
          userAccount.getUser({userId:decoded['userId']},function(err,result){
            var data = {userData:result[0],loggedIn:true};
            var incomingRequestId = parseInt(req.params.requestid);
            userAccount.tutorRequestDetails(decoded['userId'],incomingRequestId,function(err,tutorRequest){
              data['tutorRequest']=tutorRequest[0]['studentsToTutor'];
              if (app.locals.tutorDashErrorMessage) {
                data['tutorDashErrorMessage']= app.locals.tutorDashErrorMessage;
              }
              else if (app.locals.tutorDashSuccessMessage) {
                data['tutorDashSuccessMessage']= app.locals.tutorDashSuccessMessage;
              }
              res.render('tutorRequestDetails',data);
              //clear local vars
              app.locals.tutorDashErrorMessage = null;
              app.locals.tutorDashSuccessMessage = null;
            });
          });
        }
      });
    }
  });
  /*
  DASHBOARD > ACCEPT TUTOR REQUEST
  */
  app.get('/tutorrequest/accept/:requestid/:assignTutor',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded jwt in ACCEPT TUTOR REQUEST',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        //if the user is an admin
        else if(decoded['iss'] === "system"){
          var incomingRequestId = parseInt(req.params.requestid);
          var incomingAssignTutor = parseInt(req.params.assignTutor);
          userAccount.updateArrayElement({userId:incomingAssignTutor,"studentsToTutor.requestId":incomingRequestId},
          {"studentsToTutor.$.pendingStatus":false},function(err,result){

            // visual indication to the user so show an error
            Utils.debug('Error at accepting tutor request ',err);
            if(err != null || err != undefined){
              app.locals.tutorDashErrorMessage ='There was an error accepting the request.';
            }
            Utils.debug('Result at accepting tutor request ',result);
            if(result.result.ok === 1){
              app.locals.tutorDashSuccessMessage ='Tutor request was accepted successfully.';
            }
            res.redirect('/dashboard');
            });

        }
      });
    }
  });
  /*
  DASHBOARD > DENY TUTOR REQUEST
  */
  app.post('/tutorrequest/deny',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded jwt in DENY TUTOR REQUEST',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        //if the user is an admin
        else if(decoded['iss'] === "system"){
          var incomingRequestId = parseInt(req.body.requestId);
          var incomingAssignTutor = parseInt(req.body.assignTutor);
          var denialReason = req.body.denyReason;
          userAccount.pullFromArray({userId:incomingAssignTutor},{ studentsToTutor: { requestId: incomingRequestId } } ,function(err,result){
            if(err != null || err != undefined){
              app.locals.tutorErrorMessage ='There was an error denying the request.';
            }
            Utils.debug('error when pulling from tutor requests array',err);
            tutorRequests.updateTutorRequest({requestId:incomingRequestId},{rejected:true,denyReason:denialReason},function(err,result){
              // visual indication to the user so show an error
              if(err != null || err != undefined){
                app.locals.tutorDashErrorMessage ='There was an error creating request denial.';
              }
              Utils.debug('Result at denying tutor request ',result);
              if(result.result.ok === 1){
                app.locals.tutorDashSuccessMessage ='Tutor request was denied successfully.';
              }

              //**************************************************
              //let the admin know the tutor denied the request.
              //**************************************************
              res.redirect('/dashboard');

            });
          });

        }
      });
    }
  });
  /*
  DASHBOARD > RE-ASSIGN TUTOR REQUEST HANDLER
  */
  app.get('/reassigntutor/:tutorId/:requestid', function(req,res) {

    Utils.debug('req params in  RE-ASSIGN TUTOR REQ HANDLER',req.params);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){

        Utils.debug('decoded JWT at REASSIGNTUTOR HANDLER',req.params);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var incomingRequestId = parseInt(req.params.requestid);
          var incomingTutorId = parseInt(req.params.tutorId);
          tutorRequests.updateTutorRequest({requestId:incomingRequestId},{rejected:false,assignTutor:incomingTutorId},function(err,result){
            //must query for the tutor request to add ************
            tutorRequests.getRequest({requestId:incomingRequestId},function(err,result){
              //hold the req and make the necessary changes to it
              var targetReq = result[0];
              targetReq['assignTutor']= incomingTutorId;
              Utils.debug('EDITTED REQ',targetReq);

              userAccount.addToArray({userId:incomingTutorId},{studentsToTutor:targetReq},function(err,result){

                // visual indication to the user so show an error
                if(err != null || err != undefined){
                  app.locals.adminDashErrorMessage ='There was an error reassigning the request.';
                }
                Utils.debug('Result at re-assigning tutor request ',result);
                if(result.result.ok === 1){
                  app.locals.adminDashSuccessMessage ='Tutor request was reassigned successfully.';
                }

                Utils.debug('error ADDING EDITTED REQ to TUTOR ARRAY',err);
                res.redirect('/dashboard');
              });
            });

          });
        }
      });
    }
  });
}
