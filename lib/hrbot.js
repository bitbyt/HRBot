'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');
var axios = require('axios');

var HRBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'hoperivers';

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
        '\n I`m here to help you find a job. Just say `Hope Rivers` or `' + this.name + '` to invoke me!',
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
  // console.log("this users is ", this.users);
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
    return message.text.toLowerCase().indexOf('donald trump') > -1 ||
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
//end onMessage stuff

//begin onStart function
HRBot.prototype._onStart = function () {
    console.log("Lemme tell you something..");
    this._loadBotUser();
    this._firstRunCheck();
    console.log("this bot is gonna be huge!");
};

//begin onMessage function
HRBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isMentioningHRBot(message) &&
        !this._isFromHRBot(message)
    ) {
        this._replyWithHRMessage(message);
    }
};
