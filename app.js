const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const handyUtils = require('handyutils');
// Dot Env File Loader
if (!process.env.PORT) {
  require('dotenv').load();
}

// Configuration for express
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
// App config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// =-=-=-=-=-=-=-=-=-= Keys =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Public key
const publicKey = fs.readFileSync('./keys/public.pub');
// Private Key
const privateKey = fs.readFileSync('./keys/private.pem');

// =-=-=-=-=-=-=-=-=-= Config vars =-=-=-=-=-=-=-=-=-=-=-=
const port = process.env.PORT || 8080;

// =-=-=-=-=-=-=-=-=-= Routes =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
require('./routes/routes')(app, publicKey, privateKey);
// Start up the Server
const server = app.listen(port, () => {
  if (process.env.DEBUG) handyUtils.debug('Server Active On', port);
});

module.exports = server;
