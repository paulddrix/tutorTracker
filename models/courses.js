const mongodb = require('mongodb');
// Connection URL
const mongoUrl = process.env.MONGODB_URI;
const MongoClient = mongodb.MongoClient;

/**
 * @function create
 * @param course
 * An object that contains all props to create a course
 * @param callback
 * Callback function
 * @example
 * .create({
 *   courseCode: ' ADT4212',
 * }, (err, docs);
 */
exports.create = (course, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('courses');
    // Find some documents
    collection.insertOne(course).toArray((createErr, courseInfo) => {
      // Parsing mongoDoc
      callback(createErr, courseInfo);
      // Close connection
      db.close();
    });
  });
};

/**
 * @function find
 * @param query
 * An object that contains all props to find a course
 * @param callback
 * Callback function
 * @example
 * .find({
 *   courseCode: ' ADT4212',
 * }, (err, docs);
 */
exports.find = (query, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('courses');
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
 * @function update
 * @param course
 * An object that contains all props to update a course
 * @param update info
 * object with info to update
 * @param callback
 * Callback function
 * @example
 * .update({
 *   courseCode: ' ADT4212',
 * }, (err, docs);
 */
exports.update = (query, updateInfo, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('courses');
    collection.update(query, {
      $set: updateInfo,
      $currentDate: { lastModified: true },
    }, (updateErr, updateResult) => {
      callback(updateErr, updateResult);
      // close connection
      db.close();
    });
  });
};

/**
 * @function destroy
 * @param course
 * An object that contains all props to create a course
 * @param callback
 * Callback function
 * @example
 * .destroy({
 *   courseCode: ' ADT4212',
 * }, (err, docs);
 */
exports.destroy = (course, callback) => {
  // Use connect method to connect to the DB Server
  MongoClient.connect(mongoUrl, (err, db) => {
    // Get the documents collection
    const collection = db.collection('courses');
    // Find some documents
    collection.remove(course).toArray((destroyErr, destroyResult) => {
      // Parsing mongoDoc
      callback(destroyErr, destroyResult);
      // Close connection
      db.close();
    });
  });
};
