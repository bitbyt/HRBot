'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');
var axios = require('axios');
var triggers = require('../data/triggers');

var User = require('../models/user.model');

var replied = 0;

var HRBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'hoperising';
    console.log("Hello, my name is ", this.settings.name);
    this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(HRBot, Bot);

module.exports = HRBot;

HRBot.prototype.run = function() {
  HRBot.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
}

// bot onStart stuff

HRBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

HRBot.prototype._firstRunCheck = function () {
    var self = this;
};

HRBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, 'Hello, my name is Hope.' +
        '\n I`m here to help you find a job. Just say `Hope Rising` or `' + this.name + '` to invoke me!',
        {as_user: true});
};
//end onStart stuff

//bot onMessage stuff
HRBot.prototype._getChannelById = function (channelId) {
  // console.log("this is ", this);
  // console.log("this channels is ", this.channels);
    return this.channels.filter(function (item) {
      // console.log("item id is ", item.id);
        return item.id === channelId;
    })[0];
};

HRBot.prototype._getUserById = function (userId) {
  // console.log("this is ", this);
  // console.log("the users are ", this.users);
    return this.users.filter(function (item) {
      // console.log("item id is ", item.id);
        return item.id === userId;
    })[0];
};

HRBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
    console.log("this is a chat message");
};

HRBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

HRBot.prototype._isDirectConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'D';
};

HRBot.prototype._isFromHRBot = function (message) {
    return message.user === this.user.id;
};

HRBot.prototype._isMentioningHRBot = function (message) {
    return message.text.toLowerCase().indexOf('hope rising') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1 ||
        message.text.indexOf(this.user.id) > -1;
        console.log("Message is mentioning this bot ", this.name);
};

HRBot.prototype._replyWithMessageFromList = function (originalMessage, origin) {
    var self = this;
    let incomingMessage = originalMessage.text.toLowerCase();
    var user = self._getUserById(originalMessage.user);
    var channel = self._getChannelById(originalMessage.channel);
    let reply;

    for (var i = 0; i < triggers.length; i++) {
        let trigger = triggers[i]
        let triggerKey = Object.keys(triggers[i])[0]
        if (incomingMessage.indexOf(triggerKey)> -1) {
          reply = trigger[triggerKey]
        }
      }

    // self._getSavedMessages(user.name);

    if(origin === "channel") {
      self.postMessageToChannel(channel.name, reply, {as_user: true});
      replied++;
    } else if(origin === "direct") {
      self.postMessageToUser(user.name, reply, {as_user: true});
      replied++;
    }

    // self._saveMessage(user.name, reply);
}

HRBot.prototype._replyWithMessage = function (originalMessage, reply) {
  console.log("originalMessage is ", originalMessage);
  var self = this;
  var user = self._getUserById(originalMessage.user);
  var userName = user.real_name;
  var userNameArray = userName.split(" ");
  var userFirstName = userNameArray[0];
  var channel = self._getChannelById(originalMessage.channel);
  //default message reply
  let responseMessage = "Hello!";
  //default params to be passed to message replies
  let responseParams = {
    as_user: true
  }

  if(reply == "hello") {
    let responseMessages = ["Hello, " + userName + "! How may I help you today?", "Hello, " + userName + "! Looking for a job?", "Greetings, " + userName + "! Awaiting command."];
    responseMessage = responseMessages[Math.floor(Math.random()*responseMessages.length)];
  }

  else if(reply == "life") {
    responseMessage = "42";
  }

  else if(reply == "life") {
    responseMessage = "42";
  }

  else if(reply == "no idea") {
    let responseMessages = ["I'm sorry, " + userName + ". But I didn't quite catch what you said.", "I'm sorry, " + userName + ". Perhaps you can ask me what I do?", "Whoops, " + userName + ", please try again."];
    responseMessage = responseMessages[Math.floor(Math.random()*responseMessages.length)];
  }

  else if(reply == "instructions") {
    responseMessage = "Hello, " + userName + ", I'm your humble human resource assistant. For now, I mainly do job searches within the Kindjobs jobseeking app.\n\n To do a job search, just type `search` followed by [your search terms] in square brackets.";
  }

  else if(reply == "replicant") {
    responseMessage = "Is this testing whether I'm a Replicant or a lesbian, " + userFirstName + "?";
  }
  self.postMessageToUser(user.name, responseMessage, responseParams);
  console.log("number of replies in convo is ", replied);
};

HRBot.prototype._replyWithSearch = function (originalMessage, reply) {
  var self = this;
  var user = self._getUserById(originalMessage.user);
  var userName = user.real_name;
  var userNameArray = userName.split(" ");
  var channel = self._getChannelById(originalMessage.channel);
  //default message reply
  let responseMessage = "Hello!";
  //default params to be passed to message replies
  let responseParams = {
    as_user: true
  }

  //find the search terms in the originalMessage
  let startPos = originalMessage.text.indexOf('[') + 1;
  let endPos = originalMessage.text.indexOf(']');
  let searchTerms = originalMessage.text.substring(startPos, endPos);
  let resultsArr = [];

  //call kindjobs api to do the search
  axios({
    method: 'get',
    url: '/api/kindjobs?keyword=' + searchTerms.toLowerCase(),
    baseURL: 'http://kindjobs.herokuapp.com',
  }).then(function (response) {
    // console.log("searchTerms are ", searchTerms.toLowerCase());
    // console.log("response is ", response.data);
    let topResults = (response.data).splice(0, 5);
    // console.log("topResults is ", topResults);
    for (var i = 0; i < topResults.length; i++) {
      resultsArr.push({
        title: topResults[i].title,
        title_link: "http://kindjobs.herokuapp.com/#/kindjobs/" + topResults[i]._id,
        text: topResults[i].description + "\n apply here: http://kindjobs.herokuapp.com/#/apply/" + topResults[i]._id,
        color: "#3AA3E3",
        attachment_type: "default",
      })
    }
    // console.log("resultsArr is ", resultsArr);

    if(resultsArr.length === 0) {
      responseMessages = ["Sorry " + userName + ", I couldn't find what you were looking for.", "Foolish human, your search for life gives you absolutely nothing"];
      responseMessage = responseMessages[Math.floor(Math.random()*responseMessages.length)];
    } else if(resultsArr.length === 1) {
      responseMessage = "Here's the only result for " + searchTerms + ":";
      responseParams = {
        as_user: true,
        attachments: resultsArr
      }
    } else if(resultsArr.length === 2) {
      responseMessage = "There are only two results for " + searchTerms + ":";
      responseParams = {
        as_user: true,
        attachments: resultsArr
      }
    } else if(resultsArr.length === 3) {
      responseMessage = "Here are the top three results for " + searchTerms + ":";
      responseParams = {
        as_user: true,
        attachments: resultsArr
      }
    } else if(resultsArr.length === 4) {
      responseMessage = "Here are the top four results for " + searchTerms + ":";
      responseParams = {
        as_user: true,
        attachments: resultsArr
      }
    } else if(resultsArr.length === 5) {
      responseMessage = "Here are the top five results for " + searchTerms + ":";
      responseParams = {
        as_user: true,
        attachments: resultsArr
      }
    }

    self.postMessageToUser(user.name, responseMessage, responseParams);
    replied++;
  })
  .catch(function (error) {
    console.log(error);
    responseMessage = "Sorry " + userName + ", I couldn't find what you're looking for.";

    self.postMessageToUser(user.name, responseMessage, responseParams);
  });

};

// reply typeof

HRBot.prototype._channelReply = function (message) {
  let origin = "channel";
  this._replyWithMessageFromList(message, origin)
}

HRBot.prototype._directReply = function (message) {
  let origin = "direct";
  this._replyWithMessageFromList(message, origin);

  let incomingMessage = message.text.toLowerCase();

    // for now hardcode triggers and responses

    if ((incomingMessage.indexOf("hello")> -1) || (incomingMessage.indexOf("hi")> -1)) {
      let reply = "hello"
      this._replyWithMessage(message, reply)
    } else if (incomingMessage.indexOf("instructions")> -1) {
      let reply = "instructions"
      this._replyWithMessage(message, reply)
    } else if (((incomingMessage.indexOf("search")> -1) || (incomingMessage.indexOf("answer")> -1)) && (incomingMessage.indexOf("life")> -1)) {
      let reply = "life"
      this._replyWithMessage(message, reply)
    } else if (incomingMessage.indexOf("search")> -1) {
      this._replyWithSearch(message)
    } else if ((incomingMessage.indexOf("what")> -1) && (incomingMessage.indexOf("do")> -1)) {
      let reply = "instructions"
      this._replyWithMessage(message, reply)
    } else if ((incomingMessage.indexOf("nude")> -1) && (incomingMessage.indexOf("photos")> -1) && (incomingMessage.indexOf("girl")> -1)) {
      let reply = "replicant"
      this._replyWithMessage(message, reply)
    } else if ((incomingMessage.indexOf("i'm")> -1) && (incomingMessage.indexOf("done")> -1)) {
      let reply = "done"
      replied = 0
      this._replyWithMessage(message, reply)
    } else {
      let reply = "no idea"
      this._replyWithMessage(message, reply)
    }
}


//end onMessage stuff

//begin onStart function
HRBot.prototype._onStart = function () {
    this._loadBotUser();
    this._firstRunCheck();
    console.log("how can I help you");
};

//begin onMessage function
HRBot.prototype._onMessage = function (message) {

  //check if chat originates from channel or as a direct message
  if(this._isChatMessage(message) &&
      this._isMentioningHRBot(message) &&
      !this._isFromHRBot(message) &&
      this._isChannelConversation(message)
  ) {

    this._channelReply(message);

  } else if(this._isChatMessage(message) &&
      !this._isFromHRBot(message) &&
      this._isDirectConversation(message)
    ) {
      this._directReply(message);
  }
};
