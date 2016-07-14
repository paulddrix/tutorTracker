module.exports = (app) => {
  const moment = require('moment');
  const handyUtils = require('handyutils');
  const userAccount = require('../models/account');
  // const courses = require('../models/courses');
  // const tutorRequests = require('../models/tutorRequests');
  const officeHours = require('../models/officeHours');
  /*
  OFFICE HOURS
  */
  app.get('/officehours', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /officehours', decodedInfo);
    if (decodedInfo.admin === true) {
      userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
        const data = {};
        data.userData = userResult[0];
        data.loggedIn = true;
        // current date
        const currentDate = moment().format('MM/DD/YYYY');
        // Get the current month based on today's date
        officeHours.getCurrentMonth(currentDate, (currentMonthErr, currentMonth) => {
          // get all the shifts for this month
          officeHours.organizedShifts(currentMonth[0].startDate,
          currentMonth[0].endDate, (organizedShiftsErr, officeShifts) => {
            // parse shifts into a month object
            let days = [];
            for (let i = 0; i < officeShifts.length; i++) {
              let weekDay = {};
              weekDay.dayName = officeShifts[i]._id.dayName;
              weekDay.dayDate = officeShifts[i]._id.dayDate;
              weekDay.humanReadbleDate = officeShifts[i]._id.humanReadbleDate;
              weekDay['10AM-1PM'] = [];
              weekDay['1PM-4PM'] = [];
              for (let x = 0; x < officeShifts[i].shifts.length; x++) {
                if (officeShifts[i].shifts[x].shift === '10AM-1PM') {
                  weekDay['10AM-1PM'].push(officeShifts[i].shifts[x]);
                }
                if (officeShifts[i].shifts[x].shift === '1PM-4PM') {
                  weekDay['1PM-4PM'].push(officeShifts[i].shifts[x]);
                }
              }
              // push the weekDay into the array of days
              days.push(weekDay);
            }
            data.days = days;
            handyUtils.debug('FINAL DAYS OBJECT', data.days);
            // send messages to the template
            // FIXME:FLASH MESSAGES
            // if (app.locals.adminOfficeHrsErrorMessage) {
            //   data['adminOfficeHrsErrorMessage']= app.locals.adminOfficeHrsErrorMessage;
            // }
            // else if (app.locals.adminOfficeHrsSuccessMessage) {
            //   data['adminOfficeHrsSuccessMessage']= app.locals.adminOfficeHrsSuccessMessage;
            // }
            res.render('officeHours', data);
          });
        });
      });
    } else if (decodedInfo.admin === false) {
      userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
        const data = {};
        data.userData = userResult[0];
        data.loggedIn = true;
        // if (app.locals.tutorOfficeHrsErrorMessage) {
        //   data['tutorOfficeHrsErrorMessage']= app.locals.tutorOfficeHrsErrorMessage;
        // }
        // else if (app.locals.tutorOfficeHrsSuccessMessage) {
        //   data['tutorOfficeHrsSuccessMessage']= app.locals.tutorOfficeHrsSuccessMessage;
        // }
        res.render('officeHours', data);
      });
    }
  });
  /*
  OFFICE HOURS > ACCEPT SHIFT HANDLER
  */
  app.get('/officehours/accept/shift/:userId/:shiftId', (req, res) => {
    handyUtils.debug('REQ PARAMS at /officehours/accept/shift/:userId/:shiftId', req.params);
    const tutorId = parseInt(req.params.userId, 10);
    const officeShiftId = parseInt(req.params.shiftId, 10);
    userAccount.updateArrayElement({ userId: tutorId, 'officeHours.shiftId': officeShiftId },
    { 'officeHours.$.approved': true,
    'officeHours.$.pending': false }, (updateArrayErr, updateArrayResult) => {
      // Sum tutor's office hours
      userAccount.sumStdOfficeHours(tutorId, (sumStdOfficeErr, officeSum) => {
        // Update the tutor's monthlyTotalShiftHours
        userAccount.update({ userId: tutorId },
        { monthlyTotalShiftHours: officeSum[0].total }, (updateErr, updateResult) => {
          // Sum tutor's monthlyTotalShiftHours and monthlyTotalSessionHours
          userAccount.sumAllStdHours(tutorId, (sumAllStdHoursErr, totalHours) => {
            handyUtils.debug('TOTAL HOURS at ACCEPT SHIFT HANDLER', totalHours[0].totalHours);
            handyUtils.debug('ERROR at ACCEPT SHIFT HANDLER', sumAllStdHoursErr);
            const totalTutorHrs = totalHours[0].totalHours;
            // update totalHours for tutor
            userAccount.update({ userId: tutorId },
            { monthlyTotalHours: totalTutorHrs }, (updateUserErr, updateUserResult) => {
              officeHours.updateOfficeHours({ shiftId: officeShiftId },
              { approved: true, pending: false },
              (updateOfficeHoursErr, updateOfficeHoursResult) => {
                handyUtils.debug('Result at ACCEPT SHIFT HANDLER', updateOfficeHoursResult);
                handyUtils.debug('ERROR at ACCEPT SHIFT HANDLER', updateOfficeHoursErr);
                      // visual indication to the user so show an error
                      // if(err != null || err != undefined){
        // app.locals.adminOfficeHrsErrorMessage ='Oops, there was an error accepting the shift .';
                      // }
                      // if(result.result.ok === 1){
              // app.locals.adminOfficeHrsSuccessMessage ='Tutor shift was successfully accepted.';
                      // }
                res.redirect('/officehours');
              }); // Close updateOfficeHours
            }); // close updateUser
          }); // close sumAllStdHours
        }); // close updateUser
      }); // close sumStdOfficeHours
    });// close updateArrayElement
  });
  /*
  OFFICE HOURS > DENY SHIFT HANDLER
  */
  app.get('/officehours/deny/shift/:userId/:shiftId', (req, res) => {
    handyUtils.debug('REQ PARAMS at /officehours/deny/shift/:userId/:shiftId', req.params);
    handyUtils.debug('REQ PARAMS at DENY SHIFT HANDLER', req.params);
    const tutorId = parseInt(req.params.userId, 10);
    const officeShiftId = parseInt(req.params.shiftId, 10);
    userAccount.pullFromArray({ userId: tutorId },
    { officeHours: { shiftId: officeShiftId } }, (pullFromArrayErr, pullFromArrayResult) => {
      // reomve shift from tutor account
      officeHours.destroyShift({ shiftId: officeShiftId },
      (destroyShiftErr, destroyShiftResult) => {
        // Sum tutor's office hours
        userAccount.sumStdOfficeHours(tutorId, (sumStdOfficeErr, officeSum) => {
          let officeHoursSum;
          if (officeSum[0] === undefined) {
            officeHoursSum = 0;
          } else {
            officeHoursSum = officeSum[0].total;
          }
          // update sum of office hours
          userAccount.update({ userId: tutorId },
          { monthlyTotalShiftHours: officeHoursSum }, (updateErr, updateResult) => {
            userAccount.sumAllStdHours(tutorId, (sumAllStdHoursErr, totalHours) => {
              const totalTutorHrs = totalHours[0].totalHours;
              // Update the total hours for the tutor
              userAccount.update({ userId: tutorId },
              { monthlyTotalHours: totalTutorHrs }, (updateErr2, updateResult2) => {
                      // visual indication to the user so show an error
                      // if(err != null || err != undefined){
          // app.locals.adminOfficeHrsErrorMessage ='Oops, there was an error denying the shift .';
                      // }
                      // if(result.result.ok === 1){
          // app.locals.adminOfficeHrsSuccessMessage ='Tutor shift was successfully denied.';
                      // }
                res.redirect('/officehours');
              });// close updateUser
            });// closesumAllStdHours
          }); // close updateUser
        });
      });
    });
  });
  /*
  OFFICE HOURS > REMOVE SHIFT HANDLER
  */
  app.get('/officehours/remove/shift/:userId/:shiftId', (req, res) => {
    handyUtils.debug('REQ PARAMS at /officehours/remove/shift/:userId/:shiftId', req.params);
    const tutorId = parseInt(req.params.userId, 10);
    const officeShiftId = parseInt(req.params.shiftId, 10);
    userAccount.pullFromArray({ userId: tutorId },
    { officeHours: { shiftId: officeShiftId } }, (pullFromArrayErr, pullFromArrayResult) => {
      // Remove shift from tutor's accnt
      officeHours.destroyShift({ shiftId: officeShiftId },
      (destroyShiftErr, destroyShiftResult) => {
        // Sum tutor's office hours
        userAccount.sumStdOfficeHours(tutorId, (sumStdOfficeErr, officeSum) => {
          let officeHoursSum;
          if (officeSum[0] === undefined) {
            officeHoursSum = 0;
          } else {
            officeHoursSum = officeSum[0].total;
          }
          // Update tutor's office hours
          userAccount.update({ userId: tutorId },
          { monthlyTotalShiftHours: officeHoursSum }, (updateErr, updateResult) => {
            userAccount.sumAllStdHours(tutorId, (sumAllStdHoursErr, totalHours) => {
              const totalTutorHrs = totalHours[0].totalHours;
              userAccount.update({ userId: tutorId },
              { monthlyTotalHours: totalTutorHrs }, (updateErr2, updateResult2) => {
                      // visual indication to the user so show an error
                      // if(err != null || err != undefined){
          // app.locals.adminOfficeHrsErrorMessage ='Oops, there was an error removing the shift .';
                      // }
                      // if(result.result.ok === 1){
          // app.locals.adminOfficeHrsSuccessMessage ='Tutor shift was successfully removed.';
                      // }
                res.redirect('/officehours');
              });
            });
          });
        });
      });
    });
  });

  /*
  OFFICE HOURS > REQUEST SHIFT
  */
  app.get('/officehours/request/shift', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /officehours/request/shift', decodedInfo);
    userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
      const data = { userData: userResult[0], loggedIn: true };
      // current date
      const currentDate = moment().format('MM/DD/YYYY');
      officeHours.getCurrentMonth(currentDate, (getCurrentMonthErr, currentMonth) => {
        data.workableDates = currentMonth[0].workingDates;
        res.render('requestShift', data);
      });
    });
  });
  /*
  OFFICE HOURS > REQUEST SHIFT HANDLER
  */
  app.post('/officehours/request/shift/handler', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at /officehours/request/shift/handler', decodedInfo);
    if (req.body.shift === 'Both') {
      // Make request for 10AM-1PM
      const shiftDate = moment(req.body.shiftDate).format('MM/DD/YYYY');
      const shiftDateHumanFormat = moment(req.body.shiftDate).format('dddd, MMMM Do YYYY');
      const shiftDay = moment(req.body.shiftDate).format('dddd');
      const shiftId = Math.floor((Math.random() * 99999999) + 10000000);
      const newShift = {};
      newShift.dayName = shiftDay;
      newShift.shiftId = shiftId;
      newShift.dayDate = shiftDate;
      newShift.humanReadbleDate = shiftDateHumanFormat;
      newShift.shift = '10AM-1PM';
      newShift.tutorName = req.body.tutorName;
      newShift.shiftHours = 3;
      newShift.userId = parseInt(req.body.userId, 10);
      newShift.pending = true;
      newShift.approved = false;
      officeHours.createShift(newShift, (createShiftErr, createShiftResult) => {
        // send the request to the tutor's office hours array
        userAccount.addToArray({ userId: parseInt(req.body.userId, 10) },
        { officeHours: newShift }, (addToArrayErr, addToArrayResult) => {
          handyUtils.debug('result from addToArray ReqSHiftHandler', addToArrayResult);
        });
      });
      // Make request for 1PM-4PM
      const shiftDate2 = moment(req.body.shiftDate).format('MM/DD/YYYY');
      const shiftDateHumanFormat2 = moment(req.body.shiftDate).format('dddd, MMMM Do YYYY');
      const shiftDay2 = moment(req.body.shiftDate).format('dddd');
      const shiftId2 = Math.floor((Math.random() * 99999999) + 10000000);
      const newShift2 = {};
      newShift2.dayName = shiftDay2;
      newShift2.shiftId = shiftId2;
      newShift2.dayDate = shiftDate2;
      newShift2.humanReadbleDate = shiftDateHumanFormat2;
      newShift2.shift = '1PM-4PM';
      newShift2.tutorName = req.body.tutorName;
      newShift2.shiftHours = 3;
      newShift2.userId = parseInt(req.body.userId, 10);
      newShift2.pending = true;
      newShift2.approved = false;
      officeHours.createShift(newShift2, (createShiftErr, createShiftResult) => {
        // send the request to the tutor's office hours array
        userAccount.addToArray({ userId: parseInt(req.body.userId, 10) },
        { officeHours: newShift2 }, (addToArrayErr, addToArrayResult) => {
          handyUtils.debug('result from addToArray ReqSHiftHandler', addToArrayResult);
                // visual indication to the user so show an error
                // if(err != null || err != undefined){
      //   app.locals.tutorOfficeHrsErrorMessage ='Oops, there was an error requesting the shifts.';
                // }
                // if(result.result.ok === 1){
      //   app.locals.tutorOfficeHrsSuccessMessage ='Tutor shifts were successfully requested.';
                // }
          res.redirect('/officehours');
        });
      });
    } else if (req.body.shift === '10AM-1PM' || req.body.shift === '1PM-4PM') {
      const shiftDate3 = moment(req.body.shiftDate).format('MM/DD/YYYY');
      const shiftDateHumanFormat3 = moment(req.body.shiftDate).format('dddd, MMMM Do YYYY');
      const shiftDay3 = moment(req.body.shiftDate).format('dddd');
      const shiftId3 = Math.floor((Math.random() * 99999999) + 10000000);
      const newShift3 = {};
      newShift3.dayName = shiftDay3;
      newShift3.shiftId = shiftId3;
      newShift3.dayDate = shiftDate3;
      newShift3.humanReadbleDate = shiftDateHumanFormat3;
      newShift3.shift = req.body.shift;
      newShift3.tutorName = req.body.tutorName;
      newShift3.shiftHours = 3;
      newShift3.userId = parseInt(req.body.userId, 10);
      newShift3.pending = true;
      newShift3.approved = false;
      officeHours.createShift(newShift3, (createShiftErr, createShiftResult) => {
        // send the request to the tutor's office hours array
        userAccount.addToArray({ userId: parseInt(req.body.userId, 10) },
        { officeHours: newShift3 }, (addToArrayErr, addToArrayResult) => {
          handyUtils.debug('result from addToArray ReqSHiftHandler', addToArrayResult);
                // if(err != null || err != undefined){
      //   app.locals.tutorOfficeHrsErrorMessage ='Oops, there was an error requesting the shift.';
                // }
                // if(result.result.ok === 1){
    //   app.locals.tutorOfficeHrsSuccessMessage ='Tutor shift was successfully requested.';
                // }
          res.redirect('/officehours');
        });
      });
    }
  });
};
