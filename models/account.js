const mongodb = require('mongodb');
// Connection URL
const mongoUrl = process.env.MONGODB_URI;
const MongoClient = mongodb.MongoClient;

/**
 * Create a user
 * @function
 * @param {object}
 * The user object
 * @param {function}
 * Callback function with err, result
*/
exports.create = (user, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // Find some documents
    collection.insertOne(user, (createErr, createResult) => {
      // Parsing mongoDoc
      callback(createErr, createResult);
      // Close connection
      db.close();
    });
  });
};

/**
 * @function find
 * @param query
 * An object that contains all props to find a user
 * @param callback
 * Callback function
 * @example
 * .find({
 *   userName: 'Will Smith',
 * }, (err, docs);
 */
exports.find = (query, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // Find some documents
    collection.find(query).toArray((findErr, accountInfo) => {
      // Parsing mongoDoc
      callback(findErr, accountInfo);
      // Close connection
      db.close();
    });
  });
};

/**
 * destroy a user
 * @function
 * @param {object}
 * The user object
 * @param {function}
 * Callback function with err, result
*/
exports.destroy = (user, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // Find some documents
    collection.remove(user, (removeErr, removeResult) => {
      // Parsing mongoDoc
      callback(removeErr, removeResult);
      // Close connection
      db.close();
    });
  });
};

/**
 * update a user
 * @function
 * @param {object}
 * The user object
 * @param {function}
 * Callback function with err, result
*/
exports.update = (query, updateInfo, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // update user
    collection.update(query, {
      $set: updateInfo,
      $currentDate: { lastModified: true },
    }, (updateErr, updateResult) => {
      callback(updateErr, updateResult);
      // Close connection
      db.close();
    });
  });
};

/**
 * addToArray
 * @function add request to array of requests
 * @param {object}
 * The user object
 * @param {object}
 * The request info
 * @param {function}
 * Callback function with err, result
*/
exports.addToArray = (query, reqInfo, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // add tutor request to array
    collection.update(query, {
      $push: reqInfo,
      $currentDate: { dateAdded: true },
    }, (addToArrayErr, addToArrayResult) => {
      callback(addToArrayErr, addToArrayResult);
      db.close();
    });
  });
};

/**
 * pullFromArray
 * @function remove request from array of requests
 * @param {object}
 * The user object
 * @param {object}
 * The request info
 * @param {function}
 * Callback function with err, result
*/
exports.pullFromArray = (query, docToPull, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // remove tutor request from array
    collection.update(query, {
      $pull: docToPull }, (pullFromArrayErr, pullFromArrayResult) => {
        callback(pullFromArrayErr, pullFromArrayResult);
      // Close connection
        db.close();
      });
  });
};

/**
 * updateArrayElement
 * @function update request in array of requests
 * @param {object}
 * The user object
 * @param {object}
 * The request info
 * @param {function}
 * Callback function with err, result
*/
exports.updateArrayElement = (query, requestStatus, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // update tutor request in array
    collection.update(query, {
      $set: requestStatus,
    }, (updateArrayElementErr, updateArrayElementResult) => {
      callback(updateArrayElementErr, updateArrayElementResult);
      // Close connection
      db.close();
    });
  });
};

/**
 * sumStdSessions
 * @function sum tutor's sessions totals
 * @param {object}
 * The user object
 * @param {object}
 * The request info
 * @param {function}
 * Callback function with err, result
*/
exports.sumStdSessions = (userID, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // sum up tutor sessions totals
    collection.aggregate([
      { $match: { userId: userID } },
      { $unwind: '$timeSheet' },
      { $group: { _id: '$userId', total: { $sum: '$timeSheet.sessionTotal' } } },
    ], (sumStdSessionsErr, sumStdSessionsResult) => {
      callback(sumStdSessionsErr, sumStdSessionsResult);
      // Close connection
      db.close();
    });
  });
};

/**
 * sumStdOfficeHours
 * @function sums tutor's office hours totals
 * @param {object}
 * The user object
 * @param {object}
 * The request info
 * @param {function}
 * Callback function with err, result
*/
exports.sumStdOfficeHours = (userID, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // sum up tutor office hours totals
    collection.aggregate([
      { $match: { userId: userID } },
      { $unwind: '$officeHours' },
      { $group: { _id: { userId: '$userId', approved: '$officeHours.approved' },
      total: { $sum: '$officeHours.shiftHours' } } },
      { $match: { '_id.approved': true } },
    ], (sumStdOfficeHoursErr, sumStdOfficeHoursResult) => {
      callback(sumStdOfficeHoursErr, sumStdOfficeHoursResult);
      // Close connection
      db.close();
    });
  });
};

/**
 * sumAllStdHours
 * @function sums all tutor's hours
 * @param {object}
 * The user object
 * @param {object}
 * Callback function with err, result
*/
exports.sumAllStdHours = (userID, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // sum up all tutor hours
    collection.aggregate([
      { $match: { userId: userID } },
      { $project: { _id: 0, totalHours: {
        $add: ['$monthlyTotalShiftHours', '$monthlyTotalSessionHours'] } } },
    ], (sumAllStdHoursErr, sumAllStdHoursResult) => {
      callback(sumAllStdHoursErr, sumAllStdHoursResult);
      // Close connection
      db.close();
    });
  });
};

/**
 * tutorRequestDetails
 * @function get a specific tutor request
 * @param {object}
 * The userId
 * @param {object}
 * The requestId
 * @param {object}
 * Callback function with err, result
*/
exports.tutorReqDetails = (userID, requestId, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('users');
    // get a specific tutor request
    collection.aggregate([
      { $match: { userId: userID } },
      { $project: { studentsToTutor: 1 } },
      { $unwind: '$studentsToTutor' },
      { $match: { 'studentsToTutor.requestId': requestId } },
    ], (tutorReqDetailsErr, tutorReqDetailsResult) => {
      callback(tutorReqDetailsErr, tutorReqDetailsResult);
      // Close connection
      db.close();
    });
  });
};
