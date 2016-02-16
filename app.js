"use strict";
//modules
const express = require('express'),
	app = express(),
	exphbs  = require('express-handlebars');
// View engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

// =-=-=-=-=-=-=-=-=-= Config vars =-=-=-=-=-=-=-=-=-=-=-=
let port = process.env.PORT || 8080;

// =-=-=-=-=-=-=-=-=-= Routes =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
require('./routes/routes')(app);

app.listen(port);

console.log("Server running on port: ", port);
