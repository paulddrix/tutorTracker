"use strict";
//modules
const express = require('express'),
	app = express(),
	exphbs  = require('express-handlebars'),
	cookieParser = require('cookie-parser'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	Utils = require('./lib/utils'),
	jwt = require('jsonwebtoken');
// Dot Env File Loader
if(!process.env.PORT){
	let dotenv = require('dotenv').load();
}

// Configuration for express
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
//App config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// // custom middleware for support page
// app.use('/helpSupport',function (req, res, next) {
//
// 	if(req.cookies.auth === undefined){
// //try adding the result to the request, like req.typeOfAdmin = true
// 		res.redirect('/helpSupport');
// 	}
//   next();
// });
//app.use(jwt);
// =-=-=-=-=-=-=-=-=-= Keys =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//public key
const publicKey = fs.readFileSync('./keys/public.pub');
//Private Key
const privateKey = fs.readFileSync('./keys/private.pem');

//authorization middleware
// app.use(function (req, res, next) {
// 	req.typeOfAdmin = true;
//   console.log('Cookie token ', req.cookies.auth);
// 	// if(req.cookies.auth === undefined){
// 	// 	res.redirect('/login');
// 	// }
// 	//jwt.verify(req.cookies.auth, publicKey, function(err, decoded){
//
// 		// Utils.debug('decoded JWT at '+req.path,decoded);
// 		// if(decoded == undefined){
// 		// 	res.redirect('/login')
// 		// }
// 		// else if(decoded['iss'] === "system" && decoded['admin'] === true){
// 		// 	console.log("FUCKINGSHITFACE");
// 		// 	req.typeOfAdmin = true;
// 		// 	Utils.debug('ADMIN CONDITINAL ',req.typeOfAdmin);
// 		// }
// 		// else if(decoded['iss'] === "system" && decoded['admin'] === false){
// 		// 	req.typeOfAdmin = false;
// 		// 	Utils.debug('TUTOR CONDITINAL ',req.typeOfAdmin);
// 		// }
// 	//});
//   next();
// });

// =-=-=-=-=-=-=-=-=-= Config vars =-=-=-=-=-=-=-=-=-=-=-=
let port = process.env.PORT || 8080;

// =-=-=-=-=-=-=-=-=-= Routes =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
require('./routes/routes')(app,publicKey,privateKey);
// Start up the Server
var server = app.listen(port, function() {
  if (process.env.DEBUG) console.log('Server Active On', port);
});

module.exports = server;
