// for no-SQL database
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  name: { type: String },
  slackid: {
    type: String,
    unique: true,
  },
});

UserSchema.set('timestamps',{});

mongoose.model( 'User', UserSchema );
