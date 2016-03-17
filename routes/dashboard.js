"use strict";
module.exports = function(app,publicKey,privateKey) {

  const
  moment = require('moment'),
  jwt = require('jsonwebtoken'),
  Utils = require('../lib/utils'),
  //Load models
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
          userAccount.getUsers({admin:false},function(results) {
            data['tutorList']=results;
            courses.getCourses({},function(courseRes) {
              data['courseList']=courseRes;
              tutorRequests.getTutorRequests({rejected:true},function(rejectedDocs){
                data['rejectedDocs'] = rejectedDocs;
                res.render('dashboard',data);
              });
            });
          });
        }
        //if the user is a tutor
        else if(decoded['iss'] === "system" && decoded['admin'] === false){
          Utils.debug('DASHBOARD Route TUTOR conditial','TUTOR!!!!');
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('dashboard',data);
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
          userAccount.getUsers({"eligibleCourses.courseName": req.params.coursename},function(doc) {
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
          });
          userAccount.addToArray({userId:assignedTutor},{studentsToTutor:newTutorRequest},function(err,result){
            Utils.debug('error in adding tutor request tot assigned tutor',err);
          });
          res.redirect('/dashboard');
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
          userAccount.getUser({userId:decoded['userId']},function(result){
            var data = {userData:result[0],loggedIn:true};
            var incomingRequestId = parseInt(req.params.requestid);
            tutorRequests.getTutorRequests({requestId:incomingRequestId},function(request){
              data['tutorRequest'] = request[0];

              userAccount.getUsers({admin:false},function(results) {
                data['tutorList']=results;
                courses.getCourses({},function(courseRes) {
                  data['courseList']=courseRes;
                  res.render('tutorRequestDetails',data);
                });
              });
            });
          });
        }
        else if (decoded['iss'] === "system" && decoded['admin'] === false) {
          userAccount.getUser({userId:decoded['userId']},function(result){
            var data = {userData:result[0],loggedIn:true};
            var incomingRequestId = parseInt(req.params.requestid);
            userAccount.tutorRequestDetails(decoded['userId'],incomingRequestId,function(tutorRequest){
              data['tutorRequest']=tutorRequest[0]['studentsToTutor'];
              res.render('tutorRequestDetails',data);
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
          {"studentsToTutor.$.pendingStatus":false},function(result){

            //**************************************************
            //let the admin know the tutor accepted the request.
            //**************************************************
            res.redirect('back');
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

            Utils.debug('error when pulling from tutor requests array',err);
            tutorRequests.updateTutorRequest({requestId:incomingRequestId},{rejected:true,denyReason:denialReason},function(result){
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
          tutorRequests.updateTutorRequest({requestId:incomingRequestId},{rejected:false,assignTutor:incomingTutorId},function(result){
            //must query for the tutor request to add ************
            tutorRequests.getRequest({requestId:incomingRequestId},function(result){
              //hold the req and make the necessary changes to it
              var targetReq = result[0];
              targetReq['assignTutor']= incomingTutorId;
              Utils.debug('EDITTED REQ',targetReq);

              userAccount.addToArray({userId:incomingTutorId},{studentsToTutor:targetReq},function(err,result){

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
