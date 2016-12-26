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
router.put('/:baseModelId/configuration', (req, res, next) => {

  var token = req.body.token;
  var baseModelId = req.params.baseModelId;
  var arabic_numerals = req.body.arabic_numerals;

  Promise.resolve()
  .then(() => {
    if (!token) {
      var tokenError = new Error('Token is required');
      tokenError.status = 400;
      throw tokenError;
    }

    var s2t = new Speech2Text();
    return s2t.configBaseModel(token, baseModelId, arabic_numerals);
  }).then((results) => {
    res.send(results);
  }).catch((error) => {
    next(error);
  });
});


module.exports = router;
