module.exports = (app) => {
  const moment = require('moment');
  const handyUtils = require('handyutils');
  // const exec = require('child_process').exec;
  // Load models
  const userAccount = require('../models/account');
  const courses = require('../models/courses');
  const tutorRequests = require('../models/tutorRequests');
  /*
  DASHBOARD
  */
  app.get('/dashboard', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    // If the user is an admin
    if (decodedInfo.admin === true) {
      handyUtils.debug('DASHBOARD/admin req.body.decodedInfo', decodedInfo);
      const data = { userData: { admin: true }, loggedIn: true };
      userAccount.find({ admin: false }, (userErr, userResults) => {
        data.tutorList = userResults;
        courses.find({}, (courseErr, courseRes) => {
          data.courseList = courseRes;
          tutorRequests.find({ rejected: true }, (tutorReqErr, rejectedDocs) => {
            handyUtils.debug('DASHBOARD Route ADMIN rejectedDocs DATA!', rejectedDocs);
            data.rejectedDocs = rejectedDocs;
            handyUtils.debug('DASHBOARD Route ADMIN data going into view', data);
                // FIXME:add flash messages
                // if (app.locals.adminDashErrorMessage) {
                //   data.adminDashErrorMessage = app.locals.adminDashErrorMessage;
                // } else if (app.locals.adminDashSuccessMessage) {
                //   data.adminDashSuccessMessage = app.locals.adminDashSuccessMessage;
                // }
            res.render('dashboard', data);
                // clear local vars
                // FIXME: need to fix flash messages
                // app.locals.adminDashErrorMessage = null;
                // app.locals.adminDashSuccessMessage = null;
          });
        });
      });
    // if the user is a tutor
    } else if (decodedInfo.admin === false) {
      handyUtils.debug('DASHBOARD Route TUTOR conditial', 'TUTOR!!!!');
      userAccount.find({ userId: decodedInfo.userId }, (userErr, result) => {
        const data = { userData: result[0], loggedIn: true };
        handyUtils.debug('DASHBOARD Route TUTOR conditial DATA!', data);
            // FIXME:flash messages!
            // if (app.locals.tutorDashErrorMessage) {
            //   data.tutorDashErrorMessage = app.locals.tutorDashErrorMessage;
            // } else if (app.locals.tutorDashSuccessMessage) {
            //   data.tutorDashSuccessMessage = app.locals.tutorDashSuccessMessage;
            // }
        res.render('dashboard', data);
            // clear local vars
            // FIXME: add flash messagess
            // app.locals.tutorDashErrorMessage = null;
            // app.locals.tutorDashSuccessMessage = null;
      });
    }
  });
  /*
  DASHBOARD > SEARCH TUTOR ELIGIBILITY
  */
  app.get('/dashboard/tutor/eligibility/:coursename', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /dashboard/tutor/eligibility/:coursename', decodedInfo);
    userAccount.find({ 'eligibleCourses.courseName': req.params.coursename },
    (userErr, userDoc) => {
      res.send(userDoc);
    });
  });
  /*
  DASHBOARD > ADD TUTOR REQUEST HANDLER
  */
  app.post('/dashboard/add/tutor/request/handler', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('req body in ADD TUTOR REQUEST HANDLER', req.body);
    handyUtils.debug('decodedInfo addtutorrequesthandler', decodedInfo);
    const assignedTutor = parseInt(req.body.assignTutor, 10);
    const requestId = Math.floor((Math.random() * 99999999) + 10000000);
    const dateAdded = moment().format('dddd, MMMM Do YYYY, h:mm a');
    const newTutorRequest = {};
    newTutorRequest.dateAdded = dateAdded;
    newTutorRequest.firstName = req.body.firstName;
    newTutorRequest.lastName = req.body.lastName;
    newTutorRequest.email = req.body.email;
    newTutorRequest.phone = req.body.phone;
    newTutorRequest.degree = req.body.degree;
    newTutorRequest.courseToTutor = req.body.courseToTutor;
    newTutorRequest.program = req.body.program;
    newTutorRequest.assignTutor = assignedTutor;
    newTutorRequest.requestId = requestId;
    newTutorRequest.pendingStatus = true;
    tutorRequests.create(newTutorRequest,
    (createTutorReqErr, createTutorReqResult) => {
      handyUtils.debug('error in creating tutor request ', createTutorReqErr);
      handyUtils.debug('result in creating tutor request ', createTutorReqResult);
      // // visual indication to the user so show an error
      //  if (createTutorReqErr != null || createTutorReqErr !== undefined) {
      // // app.locals.errorMessage = ' There was an error creating the tutor request';
      //  }
    });
    userAccount.addToArray({ userId: assignedTutor },
    { studentsToTutor: newTutorRequest }, (addToArrayErr, addToArrayResult) => {
      handyUtils.debug('error in adding tutor request to assigned tutor', addToArrayErr);
      handyUtils.debug('results in adding tutor request to assigned tutor',
      addToArrayResult);
      // visual indication to the user so show an error
      if (addToArrayErr !== null || addToArrayErr !== undefined) {
    // app.locals.adminDashErrorMessage = 'There was an error assigning the request to the tutor.';
      }
      if (addToArrayResult.result.ok === 1) {
    // app.locals.adminDashSuccessMessage ='Tutor request was successfully added.';
      }
    // txt tutor
    // exec('curl -Xcurl -X POST http://textbelt.com/text -d number=9043074738 -d \"message=There is a new tutor request for you, please log into Tutor Tracker and address it, Thank you.\"');
      res.redirect('/dashboard');
    });
  });
  /*
  DASHBOARD > VIEW TUTOR REQUEST
  */
  app.get('/dashboard/tutor/request/:requestid', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo in VIEW TUTOR REQUEST', decodedInfo);
    if (decodedInfo.admin === true) {
      userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
        const data = { userData: userResult[0], loggedIn: true };
        const incomingRequestId = parseInt(req.params.requestid, 10);
        tutorRequests.find({ requestId: incomingRequestId },
        (tutorReqErr, tutReqResult) => {
          data.tutorRequest = tutReqResult[0];
          userAccount.find({ admin: false }, (userErr2, userResult2) => {
            data.tutorList = userResult2;
            courses.find({}, (courseErr, courseRes) => {
              data.courseList = courseRes;
              res.render('tutorReqDetails', data);
            });
          });
        });
      });
    } else if (decodedInfo.admin === false) {
      userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
        const data = { userData: userResult[0], loggedIn: true };
        const incomingRequestId = parseInt(req.params.requestid, 10);
        userAccount.tutorReqDetails(decodedInfo.userId,
        incomingRequestId, (tutReqErr, tutReqResult) => {
          data.tutorRequest = tutReqResult[0].studentsToTutor;
          // if (app.locals.tutorDashErrorMessage) {
          //   data.tutorDashErrorMessage = app.locals.tutorDashErrorMessage;
          // } else if (app.locals.tutorDashSuccessMessage) {
          //   data.tutorDashSuccessMessage = app.locals.tutorDashSuccessMessage;
          // }
          res.render('tutorReqDetails', data);
              // clear local vars
              // app.locals.tutorDashErrorMessage = null;
              // app.locals.tutorDashSuccessMessage = null;
        });
      });
    }
  });
  /*
  DASHBOARD > ACCEPT TUTOR REQUEST
  */
  app.get('/dashboard/tutor/request/accept/handler/:requestid/:assignTutor', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo in ACCEPT TUTOR REQUEST', decodedInfo);
    const incomingRequestId = parseInt(req.params.requestid, 10);
    const incomingAssignTutor = parseInt(req.params.assignTutor, 10);
    // update the tutor's students request copy
    userAccount.updateArrayElement({ userId: incomingAssignTutor,
    'studentsToTutor.requestId': incomingRequestId },
    { 'studentsToTutor.$.pendingStatus': false }, (updateArrayErr, updateArrayResult) => {
    // visual indication to the user so show an error
      handyUtils.debug('Error at accepting tutor request ', updateArrayErr);
      if (updateArrayErr !== null || updateArrayErr !== undefined) {
    // app.locals.tutorDashErrorMessage ='There was an error accepting the request.';
      }
      handyUtils.debug('Result at accepting tutor request ', updateArrayResult);
      if (updateArrayResult.result.ok === 1) {
        // app.locals.tutorDashSuccessMessage ='Tutor request was accepted successfully.';
      }
      // update the master copy in the tutor request collection
      tutorRequests.update({ requestId: incomingRequestId },
      { pendingStatus: false },
      (updateTutReqErr, updateTutReqResult) => {
        res.redirect('/dashboard');
      });
    });
  });
  /*
  DASHBOARD > DENY TUTOR REQUEST Handler
  */
  app.post('/dashboard/tutor/request/deny/handler', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo in DENY TUTOR REQUEST', decodedInfo);
    const incomingRequestId = parseInt(req.body.requestId, 10);
    const incomingAssignTutor = parseInt(req.body.assignTutor, 10);
    const denialReason = req.body.denyReason;
    userAccount.pullFromArray({ userId: incomingAssignTutor },
    { studentsToTutor: { requestId: incomingRequestId } },
    (pullFromArrayErr, pullFromArrayResult) => {
      // FIXME:flash messages
      // if (pullFromArrayErr !== null || pullFromArrayErr !== undefined) {
      //   // app.locals.tutorErrorMessage ='There was an error denying the request.';
      // }
      // if (pullFromArrayResult) {
      //   // app.locals.tutorErrorMessage ='There was an error denying the request.';
      // }
      handyUtils.debug('error when pulling from tutor requests array', pullFromArrayErr);
      tutorRequests.update({ requestId: incomingRequestId },
      { rejected: true, denyReason: denialReason },
      (updateTutReqErr, updateTutReqResult) => {
       // visual indication to the user so show an error
        if (updateTutReqErr !== null || updateTutReqErr !== undefined) {
        // app.locals.tutorDashErrorMessage ='There was an error creating request denial.';
        }
        handyUtils.debug('Result at denying tutor request ', updateTutReqResult);
        if (updateTutReqResult.result.ok === 1) {
        // app.locals.tutorDashSuccessMessage ='Tutor request was denied successfully.';
        }

        // **************************************************
        // let the admin know the tutor denied the request.
        // **************************************************
        res.redirect('/dashboard');
      });
    });
  });
  /*
  DASHBOARD > RE-ASSIGN TUTOR REQUEST HANDLER
  */
  app.get('/dashboard/reassign/tutor/:tutorId/:requestid', (req, res) => {
    handyUtils.debug('req params in  RE-ASSIGN TUTOR REQ HANDLER', req.params);
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at REASSIGNTUTOR HANDLER', decodedInfo);
    const incomingRequestId = parseInt(req.params.requestid, 10);
    const incomingTutorId = parseInt(req.params.tutorId, 10);
    tutorRequests.update({ requestId: incomingRequestId },
    { rejected: false, assignTutor: incomingTutorId },
    (updateTutReqErr, updateTutReqResult) => {
      // FIXME:add flash messages if the there is an error
      // must query for the tutor request to add ************
      tutorRequests.find({ requestId: incomingRequestId },
      (tutReqErr, tutReqResult) => {
      // hold the tutor request and make the necessary changes to it
        const targetReq = tutReqResult[0];
        targetReq.assignTutor = incomingTutorId;
        handyUtils.debug('EDITTED REQ', targetReq);
        userAccount.addToArray({ userId: incomingTutorId },
        { studentsToTutor: targetReq }, (addToArrayErr, addToArrayResult) => {
          // visual indication to the user so show an error
          if (addToArrayErr !== null || addToArrayErr !== undefined) {
        // app.locals.adminDashErrorMessage ='There was an error reassigning the request.';
          }
          handyUtils.debug('Result at re-assigning tutor request ', addToArrayResult);
          if (addToArrayResult.result.ok === 1) {
        // app.locals.adminDashSuccessMessage ='Tutor request was reassigned successfully.';
          }
          handyUtils.debug('error ADDING EDITTED REQ to TUTOR ARRAY', addToArrayErr);
          res.redirect('/dashboard');
        });
      });
    });
  });
};
