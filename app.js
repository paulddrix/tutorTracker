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
// =-=-=-=-=-=-=-=-=-= Keys =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//public key
const publicKey = fs.readFileSync('./keys/public.pub');
//Private Key
const privateKey = fs.readFileSync('./keys/private.pem');

// =-=-=-=-=-=-=-=-=-= Config vars =-=-=-=-=-=-=-=-=-=-=-=
let port = process.env.PORT || 8080;

// =-=-=-=-=-=-=-=-=-= Routes =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
require('./routes/routes')(app,publicKey,privateKey);
// Start up the Server
var server = app.listen(port, function() {
  if (process.env.DEBUG) console.log('Server Active On', port);
});

module.exports = server;
