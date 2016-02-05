module.exports = function(app) {
var bodyParser =  require('body-parser'),
 	urlencodedParser = bodyParser.urlencoded({ extended: false }),
 	cookieParser = require('cookie-parser'),
    mandrill = require('mandrill-api/mandrill'),
    //mandrill_client = new mandrill.Mandrill('R6xFyX_txF1on5jGLGWreQ'),
    jwt = require('jsonwebtoken'),
    fs = require('fs'),
    userAccount = require('../models/Account');
    courses = require('../models/Courses');
    tutorRequests = require('../models/TutorRequests');
    app.use(cookieParser());

    // =-=-=-=-=-=-=-=-=-=-=-=- Home =-=-=-=-=-=-=-=-=-=-=
    //Home page
    app.get('/',urlencodedParser, function(req, res){
    	//the root route is going to have the dashboard.
    	// console.log('req.cookies.auth',req.cookies.auth);
    	// console.log('req.body',req.body);
    	if(req.cookies.auth === undefined){
    		res.redirect('/login');
    	}
    	else{
    		// we will check if the user requesting the page is a tutor or an admin
      		// verify a token asymmetric
      		var cert = fs.readFileSync('./keys/public.pem');
      		jwt.verify(req.cookies.auth, cert, function(err, decoded){
      			console.log('decoded jwt',decoded);
          		if(decoded == undefined){
            		res.redirect('/login');
          		}
          		else if(decoded['iss'] === "system"){
                  res.redirect('/dashboard');
          		}
      		});
    	}
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= LOGIN =-=-=-=-=-=-=-=-=-=-=-=-=-=
    //login page
    app.get('/login',function(req,res){
    	res.render('login');
    });
    //login action
    app.post('/verify',urlencodedParser,function(req,res){
    	console.log('req.body',req.body);
    	if(!req.body){
    			res.sendStatus(400);
    		}
    	else{
    		//read form DB to see what type of account they have
    		userAccount.getUser(req.body,function(result){
    			console.log('results from query',result);
    			if(result[0]=== undefined){
    				res.redirect('/login');
    			}
    			else{
    				// sign with RSA SHA256
      				var cert = fs.readFileSync('./keys/private.key');  // get private key
      		  		var token = jwt.sign({ alg: 'RS256',typ:'JWT',admin:result[0].admin, email:result[0].email }, cert, { algorithm: 'RS256',issuer:'system',expiresIn:86400000});
      		  		res.cookie('auth', token, {expires: new Date(Date.now() + 900000),maxAge: 900000 });//secure: true
      		  		res.redirect('/');
    			}
    		});
    	}

    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= DASHBOARD =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/dashboard',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt in DASHBOARD Route',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              //if the user is an admin
              else if(decoded['iss'] === "system" && decoded['admin'] == true){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  userAccount.getUsers({},function(results) {
                   data['users']=results;
                   res.render('dashboard',data);
                  });
                });
              }
              //if the user is a tutor
              else{
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                   data['users']=result[0];
                   res.render('dashboard',data);
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= DASHBOARD > ADD TUTOR REQUEST =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/addtutorrequest',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                var data = {};
                userAccount.getUsers({admin:false},function(results) {
                  data['tutorList']=results;
                  courses.getCourses({},function(courseRes) {
                    data['courseList']=courseRes;
                    res.render('addTutorRequest',data);
                  });

                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= DASHBOARD > ADD TUTOR REQUEST HANDLER =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.post('/addtutorrequesthandler', urlencodedParser, function(req,res) {
      console.log('req body',req.body);
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                var comingTutor = parseInt(req.body.assignTutor);
                var newTutorRequest = {
                  "firstName": req.body.firstName,
                  "lastName": req.body.lastName,
                  "email": req.body.email,
                  "phone": req.body.phone,
                  "degree": req.body.degree,
                  "courseToTutor": req.body.courseToTutor,
                  "program": req.body.program,
                  "assignTutor": comingTutor,
                };
                tutorRequests.createRequest(newTutorRequest,function(err,result){
                  console.log('error ',err);
                });
                userAccount.updateStdReqs({idNumber:comingTutor},{studentsToTutor:newTutorRequest},function(err,result){
                  console.log('error',err);
                });
                res.redirect('/dashboard');
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= OFFICE HOURS  =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/officehours',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  userAccount.getUsers({},function(results) {
                   data['users']=results;
                   res.render('officeHours',data);
                  });
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= REQUEST SHIFT  =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/requestshift',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  userAccount.getUsers({},function(results) {
                   data['users']=results;
                   res.render('requestShift',data);
                  });
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= PROFILE =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/profile',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  res.render('profile',data);
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= EDIT PROFILE =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/editprofile',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  res.render('editProfile',data);
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= HANDLE EDIT PROFILE =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.post('/editprofilehandler',urlencodedParser,function(req,res) {
      var comingID = parseInt(req.body.idNumber);
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt in editprofilehandler',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                var editedProfile = {
                    "firstName":req.body.firstName,
                    "lastName":req.body.lastName,
                    "email":req.body.email,
                    "password":req.body.password,
                    "phone":req.body.phone,
                    "idNumber":comingID,
                };
                userAccount.updateUser({ idNumber:comingID },editedProfile,function(result){
                  console.log('result from update in editprofilehandler',result);
                  res.redirect('profile');
                });
              }
          });
      }
    });

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= USERS  =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/users',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  userAccount.getUsers({},function(results) {
                   data['users']=results;
                   res.render('users',data);
                  });
                });
              }
          });
      }
    });

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= USERS > PROFILE =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/userprofiles/:idNumber',function(req,res) {
      //making idNumber an integer
      var incomingNumber = parseInt(req.params.idNumber);
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
        // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({idNumber:incomingNumber},function(result) {
                var data={};
                 data['userProfile']=result[0];
                 res.render('userDetails',data);
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= USERS > ADD PAGE =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/adduser',function(req,res){
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  res.render('addUser',data);
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= HANDLE ADD USER =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.post('/adduserhandler',urlencodedParser,function(req,res){
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt in adduserhandler',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){

                //check if the new user is an admin
                if(req.body.admin === 'true'){
                  var comingAdmin = true;
                  var comingID = parseInt(req.body.idNumber);
                  var comingTxt;
                  if(req.body.textAlert === 'true'){
                    comingTxt= true;
                  }
                  else{
                    comingTxt= false;
                  }
                  var newUser = {
                    "email" : req.body.email,
                  	"password" : req.body.password,
                  	"degree" : false,
                  	"firstName" : req.body.firstName,
                    "lastName":req.body.lastName,
                  	"phone" : req.body.phone,
                  	"admin" : comingAdmin,
                    "textAlert":comingTxt,
                  	"idNumber":comingID,
                  };
                  userAccount.createUser(newUser,function(result, err){
                    res.redirect('/users');
                  });
                }
                else{
                  var comingID = parseInt(req.body.idNumber);
                  var comingTxt;
                  if(req.body.textAlert === 'true'){
                    comingTxt= true;
                  }
                  else{
                    comingTxt= false;
                  }
                  var newUser = {
                    "email" : req.body.email,
                  	"password" : req.body.password,
                  	"degree" : req.body.degree,
                  	"firstName" : req.body.firstName,
                    "lastName":req.body.lastName,
                  	"phone" : req.body.phone,
                  	"admin" : false,
                    "textAlert":comingTxt,
                  	"idNumber":comingID,
                    "scheduledOfficeHours":[],
                    "monthlyTotalHours":0,
                    "studentsToTutor":[],
                    "timeSheet":[],
                    "eligibleCourses":[]
                  };
                  userAccount.createUser(newUser,function(result, err){
                    res.redirect('/users');
                  });
                }
              }
          });

      }

    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= HANDLE DELETE USER =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/deleteuserhandler/:idNumber',urlencodedParser,function(req,res){
      console.log(req.params);
      var comingID = parseInt(req.params.idNumber);
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt in deleteuserhandler',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.destroyUser({idNumber:comingID},function(result,err) {
                  res.redirect("/users");
                });
              }
          });

      }

    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= USERS > EDIT PAGE =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/edituser/:idNumber',function(req,res){
      var comingID = parseInt(req.params.idNumber);
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt in edituser',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({idNumber:comingID},function(result){
                  var data = {userData:result[0]};
                  res.render('editUser',data);
                });
              }
          });
      }
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= HANDLE EDIT USER =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.post('/edituserhandler',urlencodedParser,function(req,res){
      var comingID = parseInt(req.body.idNumber);
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt in editprofilehandler',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                var comingID = parseInt(req.body.idNumber);
                var comingTxt;
                var comingAdmin;
                if(req.body.textAlert === 'true'){
                  comingTxt= true;
                }
                else{
                  comingTxt= false;
                }
                if(req.body.admin === 'true'){
                  comingAdmin= true;
                }
                else{
                  comingAdmin= false;
                }
                var editedUser = {
                  "email" : req.body.email,
                  "password" : req.body.password,
                  "degree" : req.body.degree,
                  "firstName" : req.body.firstName,
                  "lastName":req.body.lastName,
                  "phone" : req.body.phone,
                  "admin" : comingAdmin,
                  "textAlert":comingTxt,
                  "idNumber":comingID,
                };
                userAccount.updateUser({ idNumber:comingID},editedUser,function(result){

                  res.redirect('/users');
                });
              }
          });
      }

    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= TIME SHEET  =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/timesheet',function(req,res) {
      if(req.cookies.auth === undefined){
        res.redirect('/login');
      }
      else{
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt in timesheet',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var data = {userData:result[0]};
                  userAccount.getUsers({admin:false},function(results) {
                   data['users']=results;
                   res.render('timeSheet',data);
                  });
                });
              }
          });
      }
    });

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= HELP & SUPORT =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/helpSupport',function(req,res) {
      if(req.cookies.auth != undefined){
        // we will check if the user requesting the page is a tutor or an admin
          // verify a token asymmetric
          var cert = fs.readFileSync('./keys/public.pem');
          jwt.verify(req.cookies.auth, cert, function(err, decoded){
            console.log('decoded jwt',decoded);
              if(decoded == undefined){
                res.redirect('/login');
              }
              else if(decoded['iss'] === "system"){
                userAccount.getUser({email:decoded.email},function(result){
                  var userInfo = {userData:result[0]};
                  userAccount.getUsers({},function(results) {
                   userInfo['users']=results;
                   res.render('helpSupport',userInfo);
                  });
                });
              }
          });
      }
      else if(req.cookies.auth === undefined){
        res.render('helpSupport');
      }

    });

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= LOGOUT =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/logout',function(req,res){
      res.cookie('auth',"logged-out");
      res.redirect('/login');
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= FORGOT PASSWORD =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.get('/forgotpassword',function(req,res){
      res.render('forgotPassword');
    });
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-= HANDLE FORGOT PASSWORD =-=-=-=-=-=-=-=-=-=-=-=-=-=
    app.post('/forgotpasswordhanlder',urlencodedParser,function(req,res){
      res.redirect('/login');
    });


}//end export
