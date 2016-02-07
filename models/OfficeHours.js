var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={

  getOfficeHours: function(query,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeHours');
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
  createOfficeHours: function(doc,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeHours');
      // Insert some documents
      collection.insertOne(doc, function(err, result) {
        //console.log("error? ",err);
        callback(result, err);
        //close connection
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
