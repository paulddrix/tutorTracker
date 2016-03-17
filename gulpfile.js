"use strict";
var
    gulp            = require('gulp'), 
    child_process   = require('child_process'),
    exec   = require('child_process').exec,
    minifyCss = require('gulp-minify-css'),
    nodemon         = require('gulp-nodemon'),
    UserAccount = require('./models/account'),
    OfficeHours = require('./models/officeHours'),
    Courses = require('./models/courses');
    // Dot Env File Loader
    if(!process.env.PORT){
    	let dotenv = require('dotenv').load();
    }
// startup required services to run the app server
gulp.task('mongod', function() { 
    // spawn in a child process mongodb
    child_process.exec('mongod', function(err,stdout,stderr){
    	console.log(stdout);
    });
});
// Create keys and store them in the right folder
gulp.task('genRSAKeys', function() { 
  exec('openssl genrsa -out ./keys/private.pem 1024 && openssl rsa -in ./keys/private.pem -pubout > ./keys/public.pub', function(err,stdout,stderr){
    console.log(stdout);
  });
});
//Add a test user for an Admin
gulp.task('create-admin-test-user', function(done) {

    UserAccount.createUser({
    "email" : "admin@fullsail.com",
    "password" : "admin",
    "firstName" : "Admin",
    "lastName" : "Tester",
    "phone" : "999999999",
    "admin" : true,
    "textAlert" : true,
    "idNumber" : 6231231,
    "userId" : 90123212,
    }, function(doc) {
          console.log('User Email: ',doc.ops[0].email);
          console.log('User Passowrd: ',doc.ops[0].password);
    });
});

//Add a test user for an Admin
gulp.task('create-tutor-test-user', function(done) {

    UserAccount.createUser({
    "email" : "tutor@fullsail.edu",
    "password" : "tutor",
    "degree" : "Testing Apps",
    "firstName" : "Test",
    "lastName" : "User",
    "phone" : "7865189140",
    "admin" : false,
    "textAlert" : true,
    "idNumber" : 4134946,
    "userId" : 67907931,
    "monthlyTotalHours" : 0,
    "monthlyTotalShiftHours" : 0,
    "monthlyTotalSessionHours" : 0,
    "studentsToTutor" : [],
    "timeSheet" : [],
    "eligibleCourses" : [
      {
        "courseAbbr" : "TST",
        "courseName" : "Testing101",
        "courseCode" : "WDD143"
    }
    ],
    "officeHours" : [],
}, function(doc) {
          console.log('User Email: ',doc.ops[0].email);
          console.log('User Passowrd: ',doc.ops[0].password);
    });
});

//Create testing month
gulp.task('create-test-course', function(done) {

  Courses.createCourse({
    "courseAbbr" : "TST",
    "courseName" : "Testing101",
    "courseCode" : "WDD143"
},function(doc){
  console.log('when testing a tutor request, search for the folloing course, ',doc.ops[0].courseName);
  });


});
// FIXME: add a month with starting date of today and end date of today plus a month
//Create testing month
// gulp.task('create-tutor-month', function(done) {
//
//   OfficeHours.createMonth({
//   "startDate" : "02/14/2016",
//   "endDate" : "03/12/2016",
//   "workingDates" : []
// },function(doc){
//   console.log('if you are going to make a shift request, make sure it is between');
//   });
//
//
//
// });

// Run app.js with nodemon
gulp.task('dev', function () {
  nodemon({ script: 'app.js'
          , ext: 'js' }).on('restart', function () {
      console.log('restarted!')
  });
});
// Run mocha tests
gulp.task('test', function () {
    // spawn in a child process mongodb
    exec('mocha', function(err,stdout,stderr){
        console.log(stdout);
    });
});
// Minify Css files
gulp.task('minify-css', function() {
  return gulp.src('public/css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/css'));
});
// start dev environment
  gulp.task('startup', ['mongod', 'dev']);

// start dev environment
  gulp.task('setup', ['genRSAKeys', 'create-admin-test-user','create-tutor-test-user','create-test-course']);
