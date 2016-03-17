var MongoClient = require('mongodb').MongoClient;
module.exports ={
/*
   Office Shifts
  */
  getShifts: function(query,callback) {
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('officeShifts');
      // Find some documents
      collection.find(query).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  //add student request
  createShift: function(shiftReq,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('officeShifts');
      collection.insert(shiftReq, function(err, result) {
        callback(result);
        db.close();
      });
    });
  },

  destroyShift: function(shift,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('officeShifts');
      // Insert some documents
      collection.remove(shift, function(err, result) {
        callback(result, err);
        //close connection
        db.close();
      });
    });
  },
  updateOfficeHours: function(query,updateInfo,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
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
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('officeShifts');
      collection.aggregate([
        {$match:{ dayDate: { $gt: startDate, $lt: EndDate }}},
        {$group : {_id: {dayDate:"$dayDate",dayName:"$dayName",humanReadbleDate:"$humanReadbleDate"},
                            shifts: { $push:
                                            { "dayName" : "$dayName",
                                               "dayDate" : "$dayDate",
                                               "shift" : "$shift",
                                               "tutorName" : "$tutorName",
                                               "shiftHours" : "$shiftHours",
                                               "userId" : "$userId",
                                               "pending" : "$pending",
                                               "approved" : "$approved",
                                               "shiftId":"$shiftId",
                                               "humanReadbleDate":"$humanReadbleDate"
                                               }
                           }
                          }
         },
         {$sort:{"_id.dayDate":1}}
      ],function(err,result) {
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
    // Use connect method to connect to the DB Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('officeMonths');
      // Find some documents
      collection.find({ "startDate": { $lte: currentDate }, $and: [ { "endDate": { $gte: currentDate } } ] }).toArray(function(err, docs) {
        callback(docs);
        //close connection
        db.close();
      });

    });
  },
  //add a month
  createMonth: function(month,callback) {
    // Use connect method to connect to the Server
    MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
      // Get the documents collection
      var collection = db.collection('officeMonths');
      collection.insert(month, function(err, result) {
        callback(result);
        db.close();
      });
    });
  },
}//end export
