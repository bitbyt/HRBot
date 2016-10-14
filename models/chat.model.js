var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var ChatSchema = new mongoose.Schema({
  content: {
    type : Array ,
    "default" : []
  },
});

ChatSchema.set('timestamps',{});

mongoose.model('Chat', ChatSchema);
