// INITIALIZER FOR MY EXPRESS APPLICATION
var express = require('express');
var morgan = require('morgan');
// logger
var compress = require('compression');

module.exports = function() {
  var app = express();

  // initialize the required module
  if ( !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(compress());
  }
  
  return app;
};
