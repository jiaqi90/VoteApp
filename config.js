var config = {};

config.couchdb = {};
config.twilio = {};

config.couchdb.url = 'https://couchserver';
config.couchdb.port = 443;
config.couchdb.username = 'JiaqiVoteApp';
config.couchdb.password = '!password123';

config.twilio.sid = 'JiaqiVoteApp';
config.twilio.key = '!password123';
config.twilio.smsWebhook = 'https://nodeserver/vote/sms';
config.twilio.voiceWebhook = 'https://nodeserver/vote/voice';
config.disableTwilioSigCheck = false;

module.exports = config;