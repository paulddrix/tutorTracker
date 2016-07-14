const mongodb = require('mongodb');
// Connection URL
const mongoUrl = process.env.MONGODB_URI;
const MongoClient = mongodb.MongoClient;

/** createShift
 * Create a shift
 * @function
 * @param {object}
 * The shift object
 * @param {function}
 * Callback function with err, result
*/
exports.createShift = (shiftReq, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('officeMonths');
    // Find some documents
    collection.insert(shiftReq, (createShiftErr, createShiftResult) => {
      // Parsing mongoDoc
      callback(createShiftErr, createShiftResult);
      // Close connection
      db.close();
    });
  });
};

/** findShift
 * Find a shift
 * @function
 * @param {object}
 * query
 * @param {function}
 * Callback function with err, result
*/
exports.findShift = (query, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('officeMonths');
    collection.find(query).toArray((findErr, docs) => {
      callback(findErr, docs);
      db.close();
    });
  });
};

/** destroyShift
 * Find a shift
 * @function
 * @param {object}
 * shift
 * @param {function}
 * Callback function with err, result
*/
exports.destroyShift = (shift, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('officeMonths');
    collection.remove(shift, (destroyErr, docs) => {
      callback(destroyErr, docs);
      db.close();
    });
  });
};

/** updateOfficeHours
 * update Office Hours
 * @function
 * @param {object}
 * query
 * @param {object}
 * updateInfo
 * @param {function}
 * Callback function with err, result
*/
exports.updateOfficeHours = (query, updateInfo, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('officeMonths');
    collection.update(query, {
      $set: updateInfo,
    }, (updateErr, result) => {
      callback(updateErr, result);
      db.close();
    });
  });
};

/** organizedShifts
 * organize Shifts
 * @function
 * @param {string}
 * startDate
 * @param {string}
 * EndDate
 * @param {function}
 * Callback function with err, result
*/
exports.organizedShifts = (startDate, EndDate, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('officeMonths');
    collection.aggregate([
      { $match: { dayDate: { $gt: startDate, $lt: EndDate } } },
      { $group: { _id: { dayDate: '$dayDate',
        dayName: '$dayName', humanReadbleDate: '$humanReadbleDate' },
                       shifts: { $push:
                         { dayName: '$dayName',
                           dayDate: '$dayDate',
                           shift: '$shift',
                           tutorName: '$tutorName',
                           shiftHours: '$shiftHours',
                           userId: '$userId',
                           pending: '$pending',
                           approved: '$approved',
                           shiftId: '$shiftId',
                           humanReadbleDate: '$humanReadbleDate',
                         },
                        },
                },
       },
       { $sort: { '_id.dayDate': 1 } },
    ], (organizedShiftsErr, result) => {
      callback(organizedShiftsErr, result);
      db.close();
    });
  });
};

/** getCurrentMonth
 * get Current Month
 * @function
 * @param {object}
 * currentDate
 * @param {function}
 * Callback function with err, result
*/
exports.getCurrentMonth = (currentDate, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('officeMonths');
    collection.find({ startDate: { $lte: currentDate },
    $and: [{ endDate: { $gte: currentDate } }] }).toArray((getCurrentMonthErr, docs) => {
      callback(getCurrentMonthErr, docs);
      db.close();
    });
  });
};

/** createMonth
 * create Month
 * @function
 * @param {object}
 * month
 * @param {function}
 * Callback function with err, result
*/
exports.createMonth = (month, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('officeMonths');
    collection.insert(month, (createMonthErr, result) => {
      callback(createMonthErr, result);
      db.close();
    });
  });
};
