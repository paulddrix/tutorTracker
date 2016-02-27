var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={

  getShifts: function(query,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeShifts');
      // Find some documents
      collection.find(query).toArray(function(err, docs) {
        console.log('error In getShifts Func',err);
        //console.dir(docs);
        //send results
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  //add student request
  createShift: function(shiftReq,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeShifts');
      collection.insert(shiftReq, function(err, result) {
            console.log('error In createShift Func',err);
        callback(result);
        db.close();
      });
    });
  },
  
  destroyOfficeHours: function(shift,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeHours');
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
  updateOfficeHours: function(query,updateInfo,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeHours');
      collection.update(query,{
        $set: {updateInfo},
        $currentDate: { dateAdded: true }
          }, function(err, result) {
        callback(result);
      });
      //close connection
      db.close();
    });
  }
}//end export
