"use strict";
module.exports = function(app,publicKey,privateKey) {
  const jwt = require('jsonwebtoken'),
  Utils = require('../lib/utils'),
  userAccount = require('../models/account');
  /*
  LANDING PAGE
  */
  app.get('/', function(req, res){
    //the root route is going to redirect to  the dashboard.
    //check if the user has the auth cookie.
    if(req.cookies.auth === undefined){
      res.redirect('/login');
    }
    //if they do, decode it.
    else{
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, function(err, decoded){
        Utils.debug('decoded jwt in LANDING',decoded);
        if(decoded == undefined){
          res.redirect('/login');
        }
        else if(decoded['iss'] === "system"){
          res.redirect('/dashboard');

        };
      });
    }
  });
  /*
  LOGIN
  */
  app.get('/login',function(req,res){
    var data={};
    if (app.locals.loginErrorMessage) {
      data['errorMessage']= app.locals.loginErrorMessage;
    }
    else if (app.locals.loginSuccessMessage) {
      data['successMessage']= app.locals.loginSuccessMessage;
    }

    res.render('login',data);
    //clear local vars
    app.locals.loginErrorMessage = null;
    app.locals.loginSuccessMessage = null;
  });
  //Verify credentials
  app.post('/verify',function(req,res){
    Utils.debug('req body in VERIFY',req.body);
    if(!req.body){
      res.sendStatus(400);
    }
    else{
      //read from DB to see what type of account they have
      userAccount.getUser(req.body,function(err,result){
        Utils.debug('results from query in VERIFY',result);

        if(result[0]=== undefined){
          app.locals.loginErrorMessage = "Oops, your email or password didn't match.";

          res.redirect('/login');
        }
        else{

          var token = jwt.sign({ alg: 'RS256',typ:'JWT',admin:result[0].admin, userId:result[0].userId }, privateKey, { algorithm: 'RS256',issuer:'system',expiresIn:86400000});
          res.cookie('auth', token, {expires: new Date(Date.now() + 9000000),maxAge: 9000000 });//secure: true
          res.redirect('/');
        }
      });
    }
  });
  /*
  LOGOUT
  */
  app.get('/logout',function(req,res){
    res.cookie('auth',"logged-out");
    app.locals.loginSuccessMessage = "You were successfully logged out.";
    res.redirect('/login');
  });
  /*
  FORGOT PASSWORD
  */
  app.get('/user/forgotpassword/page',function(req,res){
    res.render('forgotPassword');
  });
  /*
  HANDLE FORGOT PASSWORD
  */
  app.post('/user/forgotpassword/hanlder',function(req,res){
    // FIXME: need to add functionality to be able to reset a PASSWORD
    res.redirect('/login');
  });
}
