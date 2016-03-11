"use strict";
var
    gulp            = require('gulp'), 
    child_process   = require('child_process'),
    exec   = require('child_process').exec,
    minifyCss = require('gulp-minify-css'),
    nodemon         = require('gulp-nodemon'),
    UserAccounts = require('./models/account');
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
  // FIXME: need to create admin test user
  let user = {}
	try {
    //UserAccounts.create()
	}
  catch (e) {
		console.log(e);
		return;
	}

	});

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
  gulp.task('setup', ['genRSAKeys', 'create-admin-test-user']);
