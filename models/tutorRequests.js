var MongoClient = require('mongodb').MongoClient;
module.exports ={

  getTutorRequests: function(query,callback) {
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      // Find some documents
      collection.find(query).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  getRequest: function(reqInfo,callback) {
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      // Find some documents
      collection.find(reqInfo).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  createRequest: function(request,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      // Insert some documents
      collection.insertOne(request, function(err, result) {
        callback(err,result);
        //close connection
        db.close();
      });
    });
  },
  destroyUser: function(user,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      // Insert some documents
      collection.remove(user, function(err, result) {
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  // insert new tutor request
  updateTutorRequest: function(query,updateInfo,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('tutorRequests');
      collection.update(query,
        {$set: updateInfo }, function(err, result) {
        callback(err,result);
        db.close();
      });
      //close connection

    });
  }
}//end export
