var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={

  getTutorRequests: function(query,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      // Find some documents
      collection.find(query).toArray(function(err, docs) {
        //console.log("logging out all users");
        //console.dir(docs);
        //parsing mongoDoc
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  getRequest: function(reqInfo,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      // Find some documents
      collection.find(reqInfo).toArray(function(err, docs) {
        //console.log("logging out one user");
        //console.dir(docs);
        //parsing mongoDoc
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  createRequest: function(request,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      // Insert some documents
      collection.insertOne(request, function(err, result) {
        //console.log("error? ",err);
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  destroyUser: function(user,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('tutorRequests');
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
  // insert new tutor request
  updateTutorRequest: function(query,updateInfo,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      collection.update(query,
        {$set: updateInfo }, function(err, result) {
        callback(result);
      });
      //get user id and update the information coming form the form
      //close connection
      db.close();
    });
  }
}//end export
