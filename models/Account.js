var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={

  getUsers: function(query,callback) {
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      // Find all users
      collection.find(query).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  getUser: function(userInfo,callback) {
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      // Find a user
      collection.find(userInfo).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  createUser: function(user,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      // Insert one user
      collection.insertOne(user, function(err, result) {
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  destroyUser: function(user,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      // remove a user
      collection.remove(user, function(err, result) {
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  updateUser: function(query,updateInfo,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $set: updateInfo,
        $currentDate: { lastModified: true }
          }, function(err, result) {
        callback(result);
      });
      //close connection
      db.close();
    });
  },
  /*
  DEALING WITH ARRAYS
  */
  //add element to an array
  addToArray: function(query,reqInfo,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $push: reqInfo,
        $currentDate: { dateAdded: true }
          }, function(err, result) {
        callback(result);
      });
      //close connection
      db.close();
    });
  },
  //remove element from array
  pullFromArray: function(query,docToPull,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $pull: docToPull}, function(err, result) {
        callback(result);
        //close connection
        db.close();
      });
    });
  },
  //update an element in an array
  updateArrayElement: function(query,requestStatus,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      collection.update(query,{
        $set: requestStatus,
          }, function(err, result) {
        callback(result);
      });
      //close connection
      db.close();
    });
  },
  //sums tutor's sessions totals
  sumStdSessions: function(userID,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      collection.aggregate([
        {$match:{userId:userID}},
        {$unwind : "$timeSheet" },
        {$group : { _id:'$userId', total: {$sum:"$timeSheet.sessionTotal"} }}
      ],function(err,result) {
        callback(result);
        //close connection
        db.close();
      });
    });
  },
  //get a specific tutor request
  tutorRequestDetails: function(userID,requestId,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('users');
      collection.aggregate([
        {$match:{userId:userID}},
        {$project:{studentsToTutor:1}},
        {$unwind : "$studentsToTutor" },
        {$match : {"studentsToTutor.requestId":requestId}}
      ],function(err,result) {
        callback(result);
        //close connection
        db.close();
      });
    });
  }

}//end export
