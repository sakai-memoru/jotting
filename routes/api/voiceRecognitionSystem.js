"use strict";

var express = require('express');
var router = express.Router();

var Speech2Text = require('../../lib/recaius/speech2text');
var multer = require('multer');
var upload = multer({ dest: './upload/' });
var model_id;
/**
* RECAIUSのAPIをラップするAPI
* RECAIUSの音声認識APIはID/passwordを常に送る必要があるため、ブラウザから直接利用しない。
*/
router.post('/', (req, res, next) => {
  var token = req.body.token;
  var model = req.body.model;
  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
			tokenError.status = 400;
			throw tokenError;
    }

    if (!model || typeof model.model_id === 'undefined') {
      var invalidParamsError = new Error('Invalid parameters');
			invalidParamsError.status = 400;
			throw invalidParamsError;
    }

    var s2t = new Speech2Text();
    return s2t.openSession(token, model);
  }).then((uuid) => {
    res.send(uuid);
  }).catch((error) => {
    next(error);
  });
});

/**
* RECAIUSのAPIをラップするAPI
* RECAIUSの音声認識APIはID/passwordを常に送る必要があるため、ブラウザから直接利用しない。
*/
router.delete('/:uuid/logout', (req, res, next) => {
  var token = req.query.token;
  var uuid = req.params.uuid;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
			tokenError.status = 400;
			throw tokenError;
    }

    var s2t = new Speech2Text();
    return s2t.closeSession(token, uuid);
  }).then(() => {
    res.status(204).end();
  }).catch((error) => {
    next(error);
  });
});

/**
* RECAIUSのAPIをラップするAPI
* RECAIUSの音声認識APIはID/passwordを常に送る必要があるため、ブラウザから直接利用しない。
*/
router.get('/:uuid/results', (req, res, next) => {
  var token = req.query.token;
  var uuid = req.params.uuid;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
			tokenError.status = 400;
			throw tokenError;
    }

    var s2t = new Speech2Text();
    return s2t.getResults(token, uuid);
  }).then((results) => {
    if (results) {
      res.send(results);
    } else {
      res.status(204).end();
    }
  }).catch((error) => {
    next(error);
  });
});

/**
* RECAIUSのAPIをラップするAPI
* RECAIUSの音声認識APIはID/passwordを常に送る必要があるため、ブラウザから直接利用しない。
*/
router.put('/:uuid', upload.single('voice'), (req, res, next) => {
  var token = req.body.token;
  var uuid = req.params.uuid;
  var voiceId = req.body.voiceid;
  var voice = req.file;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
			tokenError.status = 400;
			throw tokenError;
    }

    if (!voice || !voiceId) {
      var invalidParamsError = new Error('Invalid parameters');
			invalidParamsError.status = 400;
			throw invalidParamsError;
    }

    var s2t = new Speech2Text();
    return s2t.sendVoice(token, uuid, voiceId, voice);
  }).then((results) => {
    if (results) {
      res.send(results);
    } else {
      res.status(204).end();
    }
  }).catch((error) => {
    next(error);
  });
});

/**
* RECAIUSのAPIをラップするAPI
* RECAIUSの音声認識APIはID/passwordを常に送る必要があるため、ブラウザから直接利用しない。
*/
router.put('/:uuid/flush', (req, res, next) => {
  var token = req.body.token;
  var uuid = req.params.uuid;
  var voiceId = req.body.voice_id;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
			tokenError.status = 400;
			throw tokenError;
    }

    if (!voiceId) {
      var invalidParamsError = new Error('Invalid parameters');
			invalidParamsError.status = 400;
			throw invalidParamsError;
    }

    var s2t = new Speech2Text();
    return s2t.flush(token, uuid, voiceId);
  }).then((results) => {
    if (results) {
      res.send(results);
    } else {
      res.status(204).end();
    }
  }).catch((error) => {
    next(error);
  });
});


module.exports = router;
