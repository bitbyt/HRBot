'use strict';

var HRBot = require('../lib/hrbot');
var http = require('http');

var token = process.env.HR_BOT_API_KEY;
var dbPath = process.env.HR_BOT_DB_PATH;
var name = process.env.HR_BOT_NAME;

var hrbot = new HRBot({
    token: token,
    dbPath: dbPath,
    name: name
});

hrbot.run();

http.createServer(function (req, res) {

  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.send('it is running\n');

}).listen(process.env.PORT || 1234);
