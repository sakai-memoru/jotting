"use strict";

var express = require('express');
var router = express.Router();


/**
 * 音声認識サンプルアプリケーションページ
 */
router.get('/', function (req, res, next) {
    res.render('speech2text4M');
});


module.exports = router;
