var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={

  getCourses: function(query,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('courses');
      // Find some documents
      collection.find(query).toArray(function(err, docs) {
        //console.log("logging out all courses");
        //console.dir(docs);
        //parsing mongoDoc
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  getCourse: function(userInfo,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('courses');
      // Find some documents
      collection.find(userInfo).toArray(function(err, docs) {
        //console.log("logging out one user");
        //console.dir(docs);
        //parsing mongoDoc
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  createCourse: function(user,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('courses');
      // Insert some documents
      collection.insertOne(user, function(err, result) {
        //console.log("error? ",err);
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  destroyCourse: function(user,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('courses');
      // Insert some documents
      collection.remove(user, function(err, result) {
        //console.log('result from user deletion ',result);
        //console.log(err);
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  updateCourse: function(query,updateInfo,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('courses');
      collection.update(query,{
        $set: updateInfo,
        $currentDate: { lastModified: true }
          }, function(err, result) {
        callback(result);
      });
      //get user id and update the information coming form the form
      //close connection
      db.close();
    });
  }
}//end export
