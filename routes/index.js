var speech2text = require('./page/speech2text');
var speech2text4M = require('./page/speech2text4M');
var token = require('./api/token');
var voiceRecognitionSystem = require('./api/voiceRecognitionSystem');
var userLexicons = require('./api/userLexicons');
var baseModels = require('./api/baseModels');

module.exports = function (app) {
  app.get('/', function(req, res) {
    res.redirect('/speech2text4M');
  });
  app.use('/speech2text', speech2text);
  app.use('/speech2text4M', speech2text4M);
  app.use('/api/voice-recognition',voiceRecognitionSystem);

  app.use('/api/token', token);
  app.use('/api/voice-recognition/voices', voiceRecognitionSystem);
  app.use('/api/userlexicons', userLexicons);
  app.use('/api/models', baseModels);

}
