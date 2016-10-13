'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');
var axios = require('axios');

var HRBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'hoperising';

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

HRBot.prototype._isFromHRBot = function (message) {
    return message.user === this.user.id;
};

HRBot.prototype._isMentioningHRBot = function (message) {
    return message.text.toLowerCase().indexOf('hope rising') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1 ||
        message.text.indexOf(this.user.id) > -1;
        console.log("Message is mentioning this bot ", this.name);
};

HRBot.prototype._replyWithHRMessage = function (originalMessage) {
  // console.log("originalMessage is ", originalMessage);
  var self = this;
  var user = self._getUserById(originalMessage.user);
  var userName = user.real_name;
  console.log("user name is ", userName);
  var userNameArray = userName.split(" ");
  console.log("user name array is ", userNameArray);
  axios({
    method: 'get',
    url: 'quotes/personalized?q=' + userNameArray[0] + '+' + userNameArray[1],
    baseURL: 'https://api.whatdoestrumpthink.com/api/v1/',
  }).then(function (response) {
    // console.log("response is", response);
    console.log(response.data.message);
    var channel = self._getChannelById(originalMessage.channel);
    console.log("channel name is ", channel.name);
    self.postMessageToChannel(channel.name, response.data.message, {as_user: true});
  })
  .catch(function (error) {
    console.log(error);
  });
};

HRBot.prototype._replyWithMessage = function (originalMessage, reply) {
  console.log("originalMessage is ", originalMessage);
  var self = this;
  var user = self._getUserById(originalMessage.user);
  var userName = user.real_name;
  var userNameArray = userName.split(" ");
  var channel = self._getChannelById(originalMessage.channel);

  if(reply == "hello") {
    let responseMessage = "Hello, " + userName + "! How can I help you today?";
    if(typeof originalMessage.channel === 'string' &&
        originalMessage.channel[0] === 'C') {
      self.postMessageToChannel(channel.name, responseMessage, {as_user: true});
    }
    self.postMessageToUser(user.name, responseMessage, {as_user: true});
  } if(reply == "instructions") {
    let responseMessage = "To do a job search, just type `search` followed by [your search terms] in square brackets.";
    if(typeof originalMessage.channel === 'string' &&
        originalMessage.channel[0] === 'C') {
      self.postMessageToChannel(channel.name, responseMessage, {as_user: true});
    }
    self.postMessageToUser(user.name, responseMessage, {as_user: true});
  } else if(reply == "search") {
    //find the search terms in the originalMessage
    let startPos = originalMessage.text.indexOf('[') + 1;
    let endPos = originalMessage.text.indexOf(']');
    let searchTerms = originalMessage.text.substring(startPos, endPos);

    axios({
      method: 'get',
      url: '/api/kindjobs?' + searchTerms.toLowerCase(),
      baseURL: 'http://kindjobs.herokuapp.com',
    }).then(function (response) {
      // console.log("response is ", response.data);
      let topResults = (response.data).splice(0, 3);
      let resultsArr = [];
      // let responseMessage = "Here are the top three results for " + searchTerms
      // + ":\n" + topResults[0].title + ":\n http://kindjobs.herokuapp.com/#/kindjobs/" + topResults[0]._id;
      for (var i = 0; i < topResults.length; i++) {
        resultsArr.push({
          title: topResults[i].title,
          title_link: "http://kindjobs.herokuapp.com/#/kindjobs/" + topResults[i]._id,
          text: topResults[i].description + "\n apply here: http://kindjobs.herokuapp.com/#/apply/" + topResults[i]._id,
          color: "#3AA3E3",
          attachment_type: "default",
        })
      }
      let responseMessage = "Here are the top three results for " + searchTerms + ":";
      console.log("results arr is ", resultsArr);
      let responseParams = {
        as_user: true,
        attachments: resultsArr
      }
      if(typeof originalMessage.channel === 'string' &&
          originalMessage.channel[0] === 'C') {
        self.postMessageToChannel(channel.name, responseMessage, responseParams);
      }
      self.postMessageToUser(user.name, responseMessage, responseParams);
    })
    .catch(function (error) {
      console.log(error);
      let responseMessage = "Sorry " + userName + ", I couldn't find what you're looking for.";
      if(typeof originalMessage.channel === 'string' &&
          originalMessage.channel[0] === 'C') {
        self.postMessageToChannel(channel.name, responseMessage, {as_user: true});
      }
      self.postMessageToUser(user.name, responseMessage, {as_user: true});
    });
  }

};

HRBot.prototype._sendReply = function (message) {
  var self = this;
  if(typeof message.channel === 'string' &&
      message.channel[0] === 'C') {
    self.postMessageToChannel(channel.name, responseMessage, {as_user: true});
  }
  self.postMessageToUser(user.name, responseMessage, {as_user: true});
}

//end onMessage stuff

//begin onStart function
HRBot.prototype._onStart = function () {
    console.log("Hello human");
    this._loadBotUser();
    this._firstRunCheck();
    console.log("how can I help you");
};

//begin onMessage function
HRBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isMentioningHRBot(message) &&
        !this._isFromHRBot(message)
    ) {
        // this._replyWithHRMessage(message);
        let incomingMessage = message.text.toLowerCase();

        // Interesting to consider from rench by saving a json of triggers.
        // But I want my trigger values to be functions so probably look into this in the future.

        // for (var i = 0; i < triggers.length; i++) {
        //   var trigger = triggers[i]
        //   var triggerKey = Object.keys(triggers[i])[0]
        //   if (incomingMessage.indexOf(triggerKey)> -1) {
        //     var reply = trigger[triggerKey]
        //     this._replyWithMessage(message, reply)
        //   }
        // }

        // for now hardcode triggers and responses

        if (incomingMessage.indexOf("hello")> -1) {
          let reply = "hello"
          this._replyWithMessage(message, reply)
        } else if (incomingMessage.indexOf("instructions")> -1) {
          let reply = "instructions"
          this._replyWithMessage(message, reply)
        } else if (incomingMessage.indexOf("search")> -1) {
          let reply = "search"
          this._replyWithMessage(message, reply)
        }
    }
};
