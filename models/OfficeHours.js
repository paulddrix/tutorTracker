var MongoClient = require('mongodb').MongoClient,
assert = require('assert');
module.exports ={
/*
   Office Shifts
  */
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

  destroyShift: function(shift,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeShifts');
      // Insert some documents
      collection.remove(shift, function(err, result) {
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
      var collection = db.collection('officeShifts');
      collection.update(query,{
        $set: updateInfo
          }, function(err, result) {
        callback(result);
      });
      //close connection
      db.close();
    });
  },
  //group shifts
  /*
    *Get all shifts in an organized manner
    * @param {string} startDate of the month
    * @param {string} endDate of the month
  */
 organizedShifts: function(startDate,EndDate,callback) {
    // Connection URL
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeShifts');
      collection.aggregate([
        {$match:{ dayDate: { $gt: startDate, $lt: EndDate }}},
        {$group : {_id: {dayDate:"$dayDate",dayName:"$dayName"},
                            shifts: { $push:
                                            { "dayName" : "$dayName",
                                               "dayDate" : "$dayDate",
                                               "shift" : "$shift",
                                               "tutorName" : "$tutorName",
                                               "shiftHours" : "$shiftHours",
                                               "userId" : "$userId",
                                               "pending" : "$pending",
                                               "approved" : "$approved",
                                               "shiftId":"$shiftId"
                                               }
                           }
                          }
         },
         {$sort:{"_id.dayDate":1}}
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
  /*
   Office Months
  */
  getCurrentMonth: function(currentDate,callback) {
    var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tutorTracker';
    // Use connect method to connect to the DB Server
    MongoClient.connect(mongoUrl, function(err, db) {
      assert.equal(null, err);
      //console.log("Connected correctly to mongodb");
      // Get the documents collection
      var collection = db.collection('officeMonths');
      // Find some documents
      collection.find({ "startDate": { $lte: currentDate }, $and: [ { "endDate": { $gte: currentDate } } ] }).toArray(function(err, docs) {
        console.log('error In getCurrentMonth Func',err);
        //console.dir(docs);
        //send results
        callback(docs);
        //close connection
        db.close();
      });

    });
  }
}//end export
