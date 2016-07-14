module.exports = (app) => {
  const handyUtils = require('handyutils');
  const userAccount = require('../models/account');
  /*
  HELP & SUPORT
  */
  app.get('/helpSupport', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    if (decodedInfo) {
      const decodedResult = req.body.decodedInfo;
      userAccount.find({ userId: decodedResult.userId }, (findErr, findResult) => {
        const userInfo = { userData: findResult[0], loggedIn: true };
        userAccount.find({}, (userErr, userResults) => {
          userInfo.users = userResults;
          res.render('helpSupport', userInfo);
        });
      });
    } else {
      res.render('helpSupport');
    }
  });
   /*
  HELP & SUPORT > FAQ
  */
  app.get('/helpSupport/faq', (req, res) => {
    const reqRef = req;
    const decodedInfo = reqRef.body.decodedInfo;
    handyUtils.debug('decodedInfo at helpSupport FAQ', decodedInfo);
    if (decodedInfo) {
      userAccount.find({ userId: decodedInfo.userId }, (userErr, userResult) => {
        const userInfo = { userData: userResult[0], loggedIn: true };
        userAccount.find({}, (userErr2, userResult2) => {
          userInfo.users = userResult2;
          res.render('faq', userInfo);
        });
      });
    } else {
      res.render('faq');
    }
  });
};
