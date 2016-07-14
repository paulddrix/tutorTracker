const mongodb = require('mongodb');
// Connection URL
const mongoUrl = process.env.MONGODB_URI;
const MongoClient = mongodb.MongoClient;

/**
 * Create a tutor request
 * @function
 * @param {object}
 * The request object
 * @param {function}
 * Callback function with err, result
*/
exports.create = (request, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('tutorRequests');
    collection.insertOne(request, (createErr, createResult) => {
      callback(createErr, createResult);
      // close connection
      db.close();
    });
  });
};

/**
 * Find a tutor request
 * @function
 * @param {object}
 * The request object
 * @param {function}
 * Callback function with err, result
*/
exports.find = (query, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('tutorRequests');
    collection.find(query).toArray((findErr, accountInfo) => {
      callback(findErr, accountInfo);
      // Close connection
      db.close();
    });
  });
};

/**
 * update a tutor request
 * @function
 * @param {object}
 * The request object
 * @param {function}
 * Callback function with err, result
*/
exports.update = (query, updateInfo, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('tutorRequests');
    collection.update(query,
      { $set: updateInfo }, (updateErr, updateResult) => {
        callback(updateErr, updateResult);
        db.close();
      });
  });
};

/**
 * destroy a tutor request
 * @function
 * @param {object}
 * The request object
 * @param {function}
 * Callback function with err, result
*/
exports.destroy = (query, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('tutorRequests');
    collection.remove(query, (destroyErr, destroyResult) => {
      callback(destroyErr, destroyResult);
      // close connection
      db.close();
    });
  });
};
