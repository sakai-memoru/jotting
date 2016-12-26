var express = require('express');
var cors = require('cors');

var auth = require('../../lib/recaius/auth');

var router = express.Router();
var corsOptions = {
  origin: 'https://developer.recaius.io'
};


router.all('/', cors(corsOptions));

router.get('/', (req, res, next) => {
  var id = process.env.RECAIUS_ID || 'YOUR_RECAIUS_ID';
  var password = process.env.RECAIUS_PASSWORD || 'YOUR_RECAIUS_PASSWORD';

  var params = {
    serviceInfos: [
      {
        serviceName: 'speech_recog_jaJP',
        id: process.env.RECAIUS_ASR_JAJP_ID,
        password: process.env.RECAIUS_ASR_JAJP_PASSWORD
      },
      {
        serviceName: 'speech_recog_enUS',
        id: process.env.RECAIUS_ASR_ENUS_ID,
        password: process.env.RECAIUS_ASR_ENUS_PASSWORD
      },
      {
        serviceName: 'speech_recog_zhCN',
        id: process.env.RECAIUS_ASR_ZHCN_ID,
        password: process.env.RECAIUS_ASR_ZHCN_PASSWORD
      }
    ],
    expire: 300
  };

  Promise.resolve()
  .then(() => {
    return auth.authenticate(params);
  }).then((token) => {
    res.send(token);
  }).catch((error) => {
    next(error);
  });
});

router.delete('/:token', (req, res, next) => {
  var token = req.params.token;

  Promise.resolve()
  .then(() => {
    return auth.deleteToken(token);
  }).then(() => {
    res.status(204).end();
  }).catch((error) => {
    next(error);
  });
});


module.exports = router;
