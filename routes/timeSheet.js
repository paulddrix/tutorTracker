module.exports = (app) => {
  const moment = require('moment');
  const handyUtils = require('handyutils');
  const userAccount = require('../models/account');
  /*
  TIME SHEET
  */
  app.get('/timesheet', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /timesheet', decodedInfo);
    userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
      const data = { userData: userResult[0], loggedIn: true };
      userAccount.find({ admin: false }, (userErr2, userResult2) => {
        data.users = userResult2;
        res.render('timeSheet', data);
      });
    });
  });
  /*
  TIME SHEET > TUTOR TIME SHEET DETAILS
  */
  app.get('/timesheet/tutor/timesheet/details/:userId', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /timesheet/tutor/timesheet/details/:userId', decodedInfo);
    userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
      const data = { userData: userResult[0], loggedIn: true };
      const userID = parseInt(req.params.userId, 10);
      userAccount.find({ userId: userID }, (userErr2, userResult2) => {
        data.tutor = userResult2[0];
        // send messages to the template
        // FIXME:FLASH MESSAGES
        // if (app.locals.tutorTimeSheetErrorMessage) {
        //   data['tutorTimeSheetErrorMessage']= app.locals.tutorTimeSheetErrorMessage;
        // }
        // else if (app.locals.tutorTimeSheetSuccessMessage) {
        //   data['tutorTimeSheetSuccessMessage']= app.locals.tutorTimeSheetSuccessMessage;
        // }
        res.render('timeSheetDetails', data);
        // clear local vars
        // app.locals.tutorTimeSheetErrorMessage = null;
        // app.locals.tutorTimeSheetSuccessMessage = null;
      });
    });
  });
  /*
  TIME SHEET > ADD SESSION PAGE
  */
  app.get('/timesheet/create/session', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /timesheet/create/session', decodedInfo);
    userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
      const data = { userData: userResult[0], loggedIn: true };
      res.render('createSession', data);
    });
  });
  /*
  TIME SHEET > CREATE SESSION HANDLER
  */
  app.post('/timesheet/create/session/handler', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('REQ BODY at /timesheet/create/session/handler', req.body);
    handyUtils.debug('decodedInfo at /timesheet/create/session/handler', decodedInfo);
    const sessionUserId = parseInt(req.body.userId, 10);
    const startTime = moment(req.body.sessionDate + ' ' + req.body.sessionStartTime);
    const endTime = moment(req.body.sessionDate + ' ' + req.body.sessionEndTime);
    const totalHours = endTime.diff(startTime, 'minutes') / 60;
    const sessionDate = moment(req.body.sessionDate).format('MM/DD/YYYY');
    const sessionData = {};
    sessionData.sessionDate = sessionDate;
    sessionData.sessionStartTime = startTime.format('h:mm A');
    sessionData.sessionEndTime = endTime.format('h:mm A');
    sessionData.sessionTotal = totalHours;
    userAccount.addToArray({ userId: sessionUserId },
    { timeSheet: sessionData }, (addToArrayErr, addToArrayResult) => {
      // add the session to the timeSheet array.
      userAccount.sumStdSessions(sessionUserId, (sumStdSessionsErr, sumRes) => {
        // sum up all the session hour totals
        handyUtils.debug('SUM OF STUDENT SESSIONS', sumRes);
        handyUtils.debug('TOTAL SUM OF STUDENT SESSIONS', sumRes[0].total);
        userAccount.update({ userId: sessionUserId },
        { monthlyTotalSessionHours: sumRes[0].total }, (updateErr, updateResult) => {
          userAccount.sumAllStdHours(sessionUserId,
          (sumAllStdHoursErr, sumAllStdHoursRes) => {
            const totalTutorHrs = sumAllStdHoursRes[0].totalHours;
            userAccount.update({ userId: sessionUserId },
            { monthlyTotalHours: totalTutorHrs }, (updateErr2, updateResult2) => {
              // visual indication to the user so show an error
              // if(updateErr2 !== null || updateErr2 !=updateErr2= undefined){
      // app.locals.tutorTimeSheetErrorMessage ='Oops, there was an error adding a session.';
              // }
              // if(updateResult2.result.ok === 1){
    // app.locals.tutorTimeSheetHrsSuccessMessage ='Tutor session was successfully added.';
              // }
              res.redirect('/timesheet');
            });
          });
        });
      });
    });
  });
};
