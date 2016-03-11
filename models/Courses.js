var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={

  getCourses: function(query,callback) {
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('courses');
      // Find some documents
      collection.find(query).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  getCourse: function(userInfo,callback) {
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('courses');
      // Find some documents
      collection.find(userInfo).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  createCourse: function(user,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      assert.equal(null, err);
      // Get the documents collection
      var collection = db.collection('courses');
      // Insert some documents
      collection.insertOne(user, function(err, result) {
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  destroyCourse: function(user,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('courses');
      // Insert some documents
      collection.remove(user, function(err, result) {
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  updateCourse: function(query,updateInfo,callback) {
    // Connection URL
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('courses');
      collection.update(query,{
        $set: updateInfo,
        $currentDate: { lastModified: true }
          }, function(err, result) {
        callback(result);
      });
      //close connection
      db.close();
    });
  }
}//end export
