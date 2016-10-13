'use strict';

var HRBot = require('../lib/hrbot');
var express = require('../config/express');
var mongoose = require('../config/mongoose');

// run database before express application object

var db = mongoose();
var app = express();

var token = process.env.HR_BOT_API_KEY;
var dbPath = process.env.HR_BOT_DB_PATH;
var name = process.env.HR_BOT_NAME;

var hrbot = new HRBot({
    token: token,
    dbPath: dbPath,
    name: name
});

hrbot.run();

app.set('port',(process.env.PORT||1337));

app.listen(app.get('port'), function () {
  console.log('Server running at localhost: ' + app.get('port'));
});

module.exports = app;
