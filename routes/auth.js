module.exports = (app, publicKey, privateKey) => {
  const jwt = require('jsonwebtoken');
  const handyUtils = require('handyutils');
  const userAccount = require('../models/account');
  /*
  * Basic Auth for all routes
  */
  app.all('/*', (req, res, next) => {
    handyUtils.debug('Basic Auth ran, req: ', req.path);
    const reqRef = req;
    // Check cookie function
    function checkCookie() {
      if (req.cookies.auth === undefined ||
          req.cookies.auth === '' ||
          req.cookies.auth === null ||
          reqRef.cookies.auth === 'logged-out') {
        return false;
      }
      return true;
    }
    /* Whitelisted Routes */
    // Help & Support route
    if (reqRef.path === '/helpSupport' || reqRef.path === '/helpSupport/faq') {
      // Check if the user has the auth cookie.
      if (!checkCookie()) {
        next();
      } else {
        // verify a token asymmetric
        jwt.verify(req.cookies.auth, publicKey, (decodedErr, decodedToken) => {
          if (decodedToken === undefined) {
            res.redirect('/login');
          } else if (decodedToken.iss === 'system') {
            reqRef.body.decodedInfo = decodedToken;
            next();
          }
        });
      } /* Secured Routes */
    } else if (checkCookie()) {
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, (decodedErr, decodedToken) => {
        handyUtils.debug('Decoding JWTs in authCheck', decodedToken);
        if (decodedToken === undefined) {
          res.redirect('/login');
        } else if (decodedToken.iss === 'system') {
          reqRef.body.decodedInfo = decodedToken;
          next();
        }
      });
    } else if (!checkCookie()) {
      next();
    }
  });
  /*
  LANDING PAGE
  */
  app.get('/', (req, res) => {
    // the root route is going to redirect to  the dashboard.
    // check if the user has decodedInfo in the body of the request.
    if (req.body.decodedInfo === undefined) {
      res.redirect('/login');
    } else { // if they do, decode it.
      // verify a token asymmetric
      jwt.verify(req.cookies.auth, publicKey, (err, decoded) => {
        handyUtils.debug('decoded jwt in LANDING', decoded);
        if (decoded === undefined) {
          res.redirect('/login');
        } else if (decoded.iss === 'system') {
          res.redirect('/dashboard');
        }
      });
    }
  });
  /*
  LOGIN
  */
  app.get('/login', (req, res) => {
    const data = {};
    // FIXME:FLASH MESSAGES
    res.render('login', data);
  });
  // Verify credentials
  app.post('/verify', (req, res) => {
    handyUtils.debug('req body in VERIFY', req.body);
    if (!req.body) {
      res.sendStatus(400);
    } else {
      // read from DB to see what type of account they have
      userAccount.find(req.body, (err, result) => {
        handyUtils.debug('results from query in VERIFY', result);
        if (result[0] === undefined) {
          // app.locals.loginErrorMessage = 'Oops, your email or password didnt match.';
          res.redirect('/login');
        } else {
          const token = jwt.sign({ alg: 'RS256', typ: 'JWT', admin: result[0].admin,
          userId: result[0].userId },
          privateKey, { algorithm: 'RS256', issuer: 'system', expiresIn: 86400000 });
          res.cookie('auth', token,
           { expires: new Date(Date.now() + 9000000), maxAge: 9000000 }); // secure: true
          res.redirect('/');
        }
      });
    }
  });
  /*
  LOGOUT
  */
  app.get('/logout', (req, res) => {
    res.cookie('auth', 'logged-out');
    // app.locals.loginSuccessMessage = 'You were successfully logged out.'';
    res.redirect('/login');
  });
  /*
  FORGOT PASSWORD
  */
  app.get('/forgotpassword', (req, res) => {
    res.render('forgotPassword');
  });
  /*
  HANDLE FORGOT PASSWORD
  */
  app.post('forgotpassword/handler', (req, res) => {
    // FIXME: need to add functionality to be able to reset a PASSWORD
    res.redirect('/login');
  });
};
