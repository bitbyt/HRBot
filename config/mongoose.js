var config = require('./config');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = function () {
  var db = mongoose.connect(config.db);
  require('../models/user.model');
  return db;
}
