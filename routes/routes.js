module.exports = function(app) {
  const urlencodedParser =  require('body-parser').urlencoded({ extended: false }),
  cookieParser = require('cookie-parser'),
  mandrill = require('mandrill-api/mandrill'),
  moment = require('moment'),
  //mandrill_client = new mandrill.Mandrill('R6xFyX_txF1on5jGLGWreQ'),
  jwt = require('jsonwebtoken'),
  fs = require('fs'),
  //models
  userAccount = require('../models/Account'),
  courses = require('../models/Courses'),
  tutorRequests = require('../models/TutorRequests'),
  officeHours = require('../models/OfficeHours');
  app.use(cookieParser());
  //keys
  //public key
  const puCert = fs.readFileSync('./keys/public.pem');
  //Private Key
  const prCert = fs.readFileSync('./keys/private.key');

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
  		jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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

  	  		var token = jwt.sign({ alg: 'RS256',typ:'JWT',admin:result[0].admin, userId:result[0].userId }, prCert, { algorithm: 'RS256',issuer:'system',expiresIn:86400000});
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt at addtutorrequesthandler',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var comingTutor = parseInt(req.body.assignTutor);
          console.log("tutor n ",comingTutor);
          var requestId = Math.floor((Math.random() * 99999999) + 10000000);
          var dateAdded = moment().format("dddd, MMMM Do YYYY, h:mm a");
          var newTutorRequest = {
            "dateAdded":dateAdded,
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "email": req.body.email,
            "phone": req.body.phone,
            "degree": req.body.degree,
            "courseToTutor": req.body.courseToTutor,
            "program": req.body.program,
            "assignTutor": comingTutor,
            "requestId":requestId,
            "pendingStatus":true
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt in VIEW TUTOR REQUEST',decoded);
          if(decoded == undefined){
            res.redirect('/login');
          }
          //if the user is an admin
          else if(decoded['iss'] === "system"){
            var incomingRequestId = parseInt(req.params.requestid);
            userAccount.getUser({userId:decoded['userId']},function(result){
              var data = {userData:result[0],loggedIn:true};
              var incomingRequestId = parseInt(req.params.requestid);
              userAccount.tutorRequestDetails(decoded['userId'],incomingRequestId,function(tutorRequest){
                data['tutorRequest']=tutorRequest[0]['studentsToTutor'];
                res.render('tutorRequestDetails',data);
              });
            });
          }
      });
    }
  });
  /*
  DASHBOARD > ACCEPT TUTOR REQUEST
  */
  app.get('/tutorrequest/accept/:requestid/:assignTutor',urlencodedParser,function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt in VIEW TUTOR REQUEST',decoded);
          if(decoded == undefined){
            res.redirect('/login');
          }
          //if the user is an admin
          else if(decoded['iss'] === "system"){
            var incomingRequestId = parseInt(req.params.requestid);
            var incomingAssignTutor = parseInt(req.params.assignTutor);
              userAccount.updatetutorRequestDetails({userId:incomingAssignTutor,"studentsToTutor.requestId":incomingRequestId},
                {"studentsToTutor.$.pendingStatus":false},function(result){
                  //**************************************************
                  //let the admin know the tutor accepted the request.
                  //**************************************************
                res.redirect('back');
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
  OFFICE HOURS > REQUEST SHIFT
  */
  app.get('/officehours/requestshift',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt',decoded);
          if(decoded == undefined){
            res.redirect('/login');
          }
          else if(decoded['iss'] === "system"){
            userAccount.getUser({userId:decoded.userId},function(result){
              var data = {userData:result[0],loggedIn:true};
              res.render('requestShift',data);
            });
          }
      });
    }
  });
  /*
  OFFICE HOURS > REQUEST SHIFT HANDLER
  */
  app.post('/requesthandler',urlencodedParser,function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt',decoded);
          if(decoded == undefined){
            res.redirect('/login');
          }
          else if(decoded['iss'] === "system"){
            console.log(req.body);
            var shiftDate = moment(req.body.shiftDate).format("MM/DD/YYYY");
            var newShift = {
              "tutorName" : req.body.tutorName,
              "userId" : parseInt(req.body.userId),
              "status" : "pending"
            };
            // FIXME: need to query to insert the shift in the right day and shifttype.
            // officeHours.addShift({},{weeks:newShift},function(){
            //
            // });
            // userAccount.getUser({email:decoded.email},function(result){
            //   var data = {userData:result[0],loggedIn:true};
            //   userAccount.getUsers({},function(results) {
            //    data['users']=results;
            //    res.render('requestShift',data);
            //   });
            // });
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
        jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
  USERS > ADD USER HANDLER
  */
  app.post('/adduserhandler',urlencodedParser,function(req,res){
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt in adduserhandler',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          //check if the new user is an admin
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
          	"firstName" : req.body.firstName,
            "lastName":req.body.lastName,
          	"phone" : req.body.phone,
            "textAlert":comingTxt,
          	"idNumber":comingID,
            "userId":userId
          };
          if (req.body.admin == true) {
            newUser['admin']= true;
          }
          else{
            newUser['admin']= false;
          }
          if (req.body.degree) {
            newUser['degree']= req.body.degree;
          }
          userAccount.createUser(newUser,function(result, err){
            res.redirect('/users');
          });
        }
      });
    }
  });
  /*
  USERS > DELETE USER HANDLER
  */
  app.get('/users/deleteuserhandler/:userId',urlencodedParser,function(req,res){
    console.log(req.params);
    var comingUserId = parseInt(req.params.userId);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
  USERS > EDIT USER HANDLER
  */
  app.post('/edituserhandler',urlencodedParser,function(req,res){
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
            "firstName" : req.body.firstName,
            "lastName":req.body.lastName,
            "phone" : req.body.phone,
            "admin" : comingAdmin,
            "textAlert":comingTxt,
            "idNumber":comingIdNumber
          };
          if (req.body.degree !=false) {
            editedUser['degree']= req.body.degree;
          }
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
  TIME SHEET > TUTOS TIME SHEET DETAILS
  */
  app.get('/timesheet/tutortimesheetdetails/:userId',urlencodedParser,function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt in timesheet',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
            var userID = parseInt(req.params.userId);
            userAccount.getUser({userId:userID},function(results) {
             data['tutor']=results[0];
             res.render('timeSheetDetails',data);
            });
          });
        }
      });
    }
  });
  /*
  TIME SHEET > ADD SESSION PAGE
  */
  app.get('/timesheet/addsession',function(req,res) {
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // we will check if the user requesting the page is a tutor or an admin
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt in timesheet',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          userAccount.getUser({userId:decoded.userId},function(result){
            var data = {userData:result[0],loggedIn:true};
             res.render('addSession',data);
          });
        }
      });
    }
  });
  /*
  TIME SHEET > ADD SESSION HANDLER
  */
  app.post('/timesheet/addsessionhandler',urlencodedParser,function(req,res){
    console.log('req body ',req.body);
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    else{
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
        console.log('decoded jwt in editprofilehandler',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          var comingUserId = parseInt(req.body.userId);
          var startTime = moment(req.body.sessionDate + " " + req.body.sessionStartTime);
          var endTime = moment(req.body.sessionDate + " " + req.body.sessionEndTime);
          var totalHours = endTime.diff(startTime,'minutes')/60;
          var sessionDate = moment(req.body.sessionDate).format("MM/DD/YYYY");
          var sessionData = {
            "sessionDate" :sessionDate ,
            "sessionStartTime" : startTime.format('h:mm A'),
            "sessionEndTime" : endTime.format('h:mm A'),
            "sessionTotal":totalHours
          };
          userAccount.updateStdSessions({ userId:comingUserId},{timeSheet:sessionData},function(result){
          //add the session to the timeSheet array.
            userAccount.sumStdSessions(comingUserId,function(sumRes) {
              //sum up all the session hour totals
              console.log("SUM ",sumRes);
              console.log(sumRes[0].total);
              userAccount.updateUser({userId:comingUserId},{monthlyTotalSessionHours:sumRes[0].total},function(result) {
              //insert the total in the tutor's monthlyTotalSessionHours.
              //FIX ME: how to make the monthlyTotalHours always add the values
              //for monthlyTotalSessionHours and monthlyTotalShiftHours
                //userAccount.updateUser({userId:comingUserId},,function(result) {
                  //add the monthlyTotalSessionHours to the tutor's monthlyTotalHours
                  //console.log(result);
                  res.redirect('/timesheet');
                //});
              });
            });
          });
          // do aggregate func to get the sum of all the sessions and add them tp the tutor's total.
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
      jwt.verify(req.cookies.auth, puCert, function(err, decoded){
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
