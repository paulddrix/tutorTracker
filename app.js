"use strict";
//modules
const express = require('express'),
	app = express(),
	exphbs  = require('express-handlebars'),
	flash = require('connect-flash'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser');
// View engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

// =-=-=-=-=-=-=-=-=-= Config vars =-=-=-=-=-=-=-=-=-=-=-=
let port = process.env.PORT || 8080;

// =-=-=-=-=-=-=-=-=-= Routes =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
require('./routes/routes')(app);

app.listen(port);

console.log("Server running on port: ", port);
