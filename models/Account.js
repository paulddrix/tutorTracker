var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={

  getUsers: function(query,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
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
  getUser: function(userInfo,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
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
  createUser: function(user,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
      // Insert some documents
      collection.insertOne(user, function(err, result) {
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
      var collection = db.collection('users');
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
  updateUser: function(query,updateInfo,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
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
  },
  //add student request
  addStdReq: function(query,reqInfo,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $push: reqInfo,
        $currentDate: { dateAdded: true }
          }, function(err, result) {
        callback(result);
      });
      //get user id and update the information coming form the form
      //close connection
      db.close();
    });
  },
  //remove student request
  destroyStdReq: function(query,reqToDestroy,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $pull: reqToDestroy}, function(err, result) {
        callback(result);
        //close connection
        db.close();
      });
    });
  },
  //update tutor's sessions
  updateStdSessions: function(query,sessionInfo,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $push: sessionInfo,
        $currentDate: { dateAdded: true }
          }, function(err, result) {
        callback(result);
      });
      //get user id and update the information coming form the form
      //close connection
      db.close();
    });
  },
  //sums tutor's sessions totals
  sumStdSessions: function(userID,callback) {
    console.log(userID);
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
      collection.aggregate([
        {$match:{userId:userID}},
        {$unwind : "$timeSheet" },
        {$group : { _id:'$userId', total: {$sum:"$timeSheet.sessionTotal"} }}
      ],function(err,result) {
        if (err) {
          console.log(err);
        }
        callback(result);
        //close connection
        db.close();
      });
    });
  },
  //get a specific tutor request
  tutorRequestDetails: function(userID,requestId,callback) {
    console.log(userID);
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
      collection.aggregate([
        {$match:{userId:userID}},
        {$project:{studentsToTutor:1}},
        {$unwind : "$studentsToTutor" },
        {$match : {"studentsToTutor.requestId":requestId}}
      ],function(err,result) {
        if (err) {
          console.log(err);
        }
        callback(result);
        //close connection
        db.close();
      });
    });
  },
  //update a specific tutor request
  updatetutorRequestDetails: function(query,requestStatus,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $set: requestStatus,
          }, function(err, result) {
        callback(result);
      });
      //get user id and update the information coming form the form
      //close connection
      db.close();
    });
  }

}//end export
