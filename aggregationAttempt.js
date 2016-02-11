
   {
     key: { userId:16920059, 'timeSheet': 1 },
     cond: { sessionDate: { $gt: new Date( '02/01/2012' ) } },
     reduce: function( curr, result ) {
                 result.totalSessionHours += curr.item.sessionTotal;
             },
     initial: { totalSessionHours : 0 }
   }

   db.users.aggregate(
      [
         {
            $project: {
               monthlyTotalSessionHours: 1
            }
         },
         {
            $group:{
              key: { userId:1 },
              cond: { sessionDate: { $gt: new Date( '02/01/2012' ) } },
              reduce: function( curr, result ) {
                          result.totalSessionHours += curr.timeSheet.sessionTotal;
                      },
              totalSessionHours: { $sum : "sessionTotal" }
            }
         }
      ]
   )

   [
      {$match:{userId:16920059}},
      {$project:{_id:0,timeSheet:1}},
      {$group:{_id:"$sessionDate",totalSessionHours:{$sum:"$sessionTotal"}}},
      {$project:{_id:0,totalSessionHours:1}}
   ]


   [
      {$match:{userId:16920059}},
      {$project:{_id:0,timeSheet:1}},
      {$unwind : "$timeSheet" },
   ]
