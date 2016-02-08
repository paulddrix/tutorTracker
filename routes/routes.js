module.exports = function(app) {
  var bodyParser =  require('body-parser'),
  urlencodedParser = bodyParser.urlencoded({ extended: false }),
  cookieParser = require('cookie-parser'),
  mandrill = require('mandrill-api/mandrill'),
  //mandrill_client = new mandrill.Mandrill('R6xFyX_txF1on5jGLGWreQ'),
  jwt = require('jsonwebtoken'),
  fs = require('fs'),
  //models
  userAccount = require('../models/Account'),
  courses = require('../models/Courses'),
  tutorRequests = require('../models/TutorRequests'),
  officeHours = require('../models/OfficeHours');
  app.use(cookieParser());

  /*
  LANDING PAGE
  */
  app.get('/',urlencodedParser, function(req, res){
  	//the root route is going to redirect to  the dashboard.
    //check if the user has the auth cookie.
  	if(req.cookies.auth === undefined){
  		res.redirect('/login');
  	}
    //if they do, decode it.
  	else{
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
  /*
  LOGIN
  */
  app.get('/login',function(req,res){
  	res.render('login');
  });
  //Verify credentials
  app.post('/verify',urlencodedParser,function(req,res){
  	console.log('req.body',req.body);
  	if(!req.body){
  			res.sendStatus(400);
  	}
  	else{
  		//read from DB to see what type of account they have
  		userAccount.getUser(req.body,function(result){
  			console.log('results from query',result);
  			if(result[0]=== undefined){
  				res.redirect('/login');
  			}
  			else{
  				// sign with RSA SHA256
  				var cert = fs.readFileSync('./keys/private.key');  // get private key
  	  		var token = jwt.sign({ alg: 'RS256',typ:'JWT',admin:result[0].admin, userId:result[0].userId }, cert, { algorithm: 'RS256',issuer:'system',expiresIn:86400000});
  	  		res.cookie('auth', token, {expires: new Date(Date.now() + 9000000),maxAge: 9000000 });//secure: true
  	  		res.redirect('/');
  			}
  		});
  	}
  });
  /*
  DASHBOARD
  */
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
          var data = {userData:{admin:true},loggedIn:true};
          userAccount.getUsers({admin:false},function(results) {
            data['tutorList']=results;
            courses.getCourses({},function(courseRes) {
              data['courseList']=courseRes;
              res.render('dashboard',data);
            });
          });
        }
        //if the user is a tutor
        else{
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
             data['users']=result[0];
             res.render('dashboard',data);
          });
        }
      });
    }
  });
  /*
  DASHBOARD > SEARCH TUTOR ELIGIBILITY
  */
  app.get('/tutoreligibility/:coursename', urlencodedParser,function(req,res){
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
          userAccount.getUsers({"eligibleCourses.courseName": req.params.coursename},function(doc) {
            res.send(doc);
          });
        }
        //if the user is a tutor
        else{
          res.redirect('/login');
        }
      });
    }
  });
  /*
  DASHBOARD > ADD TUTOR REQUEST HANDLER
  */
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
          var requestId = Math.floor((Math.random() * 99999999) + 10000000);
          var newTutorRequest = {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "email": req.body.email,
            "phone": req.body.phone,
            "degree": req.body.degree,
            "courseToTutor": req.body.courseToTutor,
            "program": req.body.program,
            "assignTutor": comingTutor,
            "requestId":requestId
          };
          tutorRequests.createRequest(newTutorRequest,function(err,result){
            console.log('error ',err);
          });
          userAccount.updateStdReqs({userId:comingTutor},{studentsToTutor:newTutorRequest},function(err,result){
            console.log('error',err);
          });
          res.redirect('/dashboard');
        }
      });
    }
  });
  /*
  DASHBOARD > VIEW TUTOR REQUEST
  */
  app.get('/tutorrequest/:requestid',urlencodedParser,function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      var cert = fs.readFileSync('./keys/public.pem');
      jwt.verify(req.cookies.auth, cert, function(err, decoded){
        console.log('decoded jwt in VIEW TUTOR REQUEST',decoded);
          if(decoded == undefined){
            res.redirect('/login');
          }
          //if the user is an admin
          else if(decoded['iss'] === "system"){
            userAccount.getUser({userId:decoded.userId},function(result){
              var data = {userData:result[0],loggedIn:true};
              tutorRequests.getRequest({},function(results){
                data['tutorRequest'] = results[0];
                res.render('tutorRequestDetails',data);
              });
            });
          }
      });
    }
  });
  /*
  OFFICE HOURS
  */
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
            var data={};
            userAccount.getUser({userId:decoded.userId},function(result){
              data['userData'] = result[0];
              data['loggedIn'] = true;
              officeHours.getOfficeHours({},function(results) {
                console.log('OFFICE DATA',results[0]);
                data['officeHours'] = results[0];
                res.render('officeHours',data);
              });
            });
          }
      });
    }
  });
  /*
  REQUEST SHIFT
  */
  app.get('/officehours/requestshift',function(req,res) {
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
              var data = {userData:result[0],loggedIn:true};
              userAccount.getUsers({},function(results) {
               data['users']=results;
               res.render('requestShift',data);
              });
            });
          }
      });
    }
  });
  /*
  PROFILE
  */
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
              userAccount.getUser({userId:decoded.userId},function(result){
                var data = {userData:result[0],loggedIn:true};
                res.render('profile',data);
              });
            }
        });
    }
  });
  /*
  EDIT PROFILE
  */
  app.get('/profile/editprofile',function(req,res) {
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
            userAccount.getUser({userId:decoded.userId},function(result){
              console.log("edit profile page ",result[0]);
              var data = {userData:result[0],loggedIn:true};
              res.render('editProfile',data);
            });
          }
      });
    }
  });
  /*
  HANDLE EDIT PROFILE
  */
  app.post('/editprofilehandler',urlencodedParser,function(req,res) {
    var comingUserId = parseInt(req.body.userId);
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
                "phone":req.body.phone
            };
            userAccount.updateUser({ userId:comingUserId },editedProfile,function(result){
              console.log('result from update in editprofilehandler',result);
              res.redirect('profile');
            });
          }
      });
    }
  });
  /*
  USERS
  */
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
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            userAccount.getUsers({},function(results) {
             data['users']=results;
             res.render('users',data);
            });
          });
        }
      });
    }
  });
  /*
  USERS > PROFILE
  */
  app.get('/users/userprofiles/:userId',function(req,res) {
    //making idNumber an integer
    var incomingNumber = parseInt(req.params.userId);
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
          userAccount.getUser({userId:incomingNumber},function(result) {
          var data={loggedIn:true};
           data['userProfile']=result[0];
           res.render('userDetails',data);
          });
        }
      });
    }
  });
  /*
  USERS > ADD PAGE
  */
  app.get('/users/adduser',function(req,res){
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
        else if(decoded['iss'] === "system" && decoded['admin'] == true){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('addUser',data);
          });
        }
      });
    }
  });
  /*
  HANDLE ADD USER
  */
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
            var userId = Math.floor((Math.random() * 99999999) + 10000000);
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
              "userId":userId
            };
            userAccount.createUser(newUser,function(result, err){
              res.redirect('/users');
            });
          }
          else{
            var comingID = parseInt(req.body.idNumber);
            var userId = Math.floor((Math.random() * 99999999) + 10000000);
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
              "userId":userId,
              "scheduledOfficeHours":[],
              "monthlyTotalHours":0,
              "monthlyTotalShiftHours": 0,
              "monthlyTotalSessionHours":0,
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
  /*
  HANDLE DELETE USER
  */
  app.get('/deleteuserhandler/:userID',urlencodedParser,function(req,res){
    console.log(req.params);
    var comingUserId = parseInt(req.params.userID);
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
            userAccount.destroyUser({userId:comingUserId},function(result,err) {
              res.redirect("/users");
            });
          }
      });
    }
  });
  /*
  USERS > EDIT PAGE
  */
  app.get('/users/edituser/:userId',function(req,res){
    var comingUserId= parseInt(req.params.userId);
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
          userAccount.getUser({userId:comingUserId},function(result){
            var data = {userData:result[0],loggedIn:true};
            res.render('editUser',data);
          });
        }
      });
    }
  });
  /*
  HANDLE EDIT USER
  */
  app.post('/edituserhandler',urlencodedParser,function(req,res){
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
          var comingIdNumber = parseInt(req.body.idNumber);
          var comingUserId = parseInt(req.body.userId);
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
            "idNumber":comingIdNumber
          };
          userAccount.updateUser({ userId:comingUserId},editedUser,function(result){
            res.redirect('/users');
          });
        }
      });
    }
  });
  /*
  TIME SHEET
  */
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
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            userAccount.getUsers({admin:false},function(results) {
             data['users']=results;
             res.render('timeSheet',data);
            });
          });
        }
      });
    }
  });
  /*
  HELP & SUPORT
  */
  app.get('/helpSupport',function(req,res) {
    if(req.cookies.auth != undefined){
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      var cert = fs.readFileSync('./keys/public.pem');
      jwt.verify(req.cookies.auth, cert, function(err, decoded){
        console.log('decoded jwt',decoded);
        if(decoded == undefined){
          res.render('helpSupport');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var userInfo = {userData:result[0],loggedIn:true};
            userAccount.getUsers({},function(results) {
             userInfo['users']=results;
             res.render('helpSupport',userInfo);
            });
          });
        }
      });
    }
    else{
      res.render('helpSupport');
    }
  });
  /*
  LOGOUT
  */
  app.get('/logout',function(req,res){
    res.cookie('auth',"logged-out");
    res.redirect('/login');
  });
  /*
  FORGOT PASSWORD
  */
  app.get('/forgotpassword',function(req,res){
    res.render('forgotPassword');
  });
  /*
  HANDLE FORGOT PASSWORD
  */
  app.post('/forgotpasswordhanlder',urlencodedParser,function(req,res){
    res.redirect('/login');
  });

}//end export
