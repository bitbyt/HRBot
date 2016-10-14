// for no-SQL database
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  name: { type: String },
  slack_id: {
    type: String,
    unique: true,
  },
  chat_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
});

UserSchema.set('timestamps',{});

mongoose.model( 'User', UserSchema );
