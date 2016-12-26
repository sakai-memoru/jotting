"use strict";

var express = require('express');
var cors = require('cors');
var multer = require('multer');

var Speech2Text = require('../../lib/recaius/speech2text');

var router = express.Router();
var corsOptions = {
    origin: "https://developer.recaius.io"
};
var upload = multer({ dest: './upload/' });

router.all('/', cors(corsOptions));

/**
* RECAIUSのAPIをラップするAPI
* RECAIUSの音声合成APIはID/passwordを常に送る必要があるため、ブラウザから直接利用しない。
*/
router.post('/', (req, res, next) => {

  var token = req.body.token;
  var base_model_id = req.body.base_model_id;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
      tokenError.status = 400;
      throw tokenError;
    }

    if (!base_model_id ) {
      var invalidParamsError = new Error('Invalid parameters');
      invalidParamsError.status = 400;
      throw invalidParamsError;
    }

    var s2t = new Speech2Text();
    return s2t.createUserLexicon(token, base_model_id);
  }).then((model_id) => {
    res.send(model_id);
  }).catch((error) => {
    next(error);
  });
});


router.put('/:userlexiconId/configuration', (req, res, next) => {

  var token = req.body.token;
  var user_lexicon_id = req.params.userlexiconId;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
      tokenError.status = 400;
      throw tokenError;
    }

    var s2t = new Speech2Text();
    return s2t.configUserLexicon(token, user_lexicon_id);
  }).then((results) => {
    res.send(results);
  }).catch((error) => {
    next(error);
  });
});


router.delete('/:userlexiconId', (req, res, next) => {

  var token = req.body.token;
  var user_lexicon_id = req.params.userlexiconId;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
      tokenError.status = 400;
      throw tokenError;
    }

    var s2t = new Speech2Text();
    return s2t.deleteUserLexicon(token, user_lexicon_id);
  }).then(() => {
    res.status(204).end();
  }).catch((error) => {
    next(error);
  });
});



module.exports = router;
