var totalResultStr = '';
var timerId;
var intervalId;
var timelimitMs = 30000; //自動で録音停止するまでの時間(10秒)
var timelimitSec = timelimitMs/1000; //録音残り時間表示用

var base_model_id = 1;      //ベースモデルID(デフォルト1).
var user_lexicon_id = 1;    //ユーザ辞書モデルのID(デフォルト1).

var ARABIC_ON = 1;          //アラビア変換機能オン.
var ARABIC_OFF = 0;         //アラビア変換機能オフ.

// variable for AAI
var totalResultStrBuff = ''; // totalResultStrをbuffering
var totalResultStrTemp = ''; // textarea "#js-text-textview-temp"
var totalResultStrHist = ''; // div '#js-div-history'
var totalResultStrLog =  ''; // dump用

/**
 * RECAIUS音声認識ライブラリへの接続パラメーターセット
 */
function initialize() {
    var options = {};
    //接続用パラメータ
    options["format"] = ""
    options["host"] = "/api/voice-recognition"; //ID/PASSWORDを隠蔽するため、ラッパーAPIを立ててそこからアクセスする
    options["model"] = {};
    options["model"]["energy_threshold"] = 300;
    options["model"]["model_id"] = user_lexicon_id; //必須, 数値のみ
    options["model"]["audio_type"] = "audio/x-linear"; //WebRTCはリニアPCMのみ対応
    options["model"]["push_to_talk"] = false;
    options["model"]["result_type"] = "nbest"; //本サンプルはnbestの結果1のみ対応
    options["model"]["result_count"] = 1;
    options["buffer_time"] = 512; //音声データのバッファサイズを設定(ミリ秒) 必要な最小バッファサイズ以下の場合、最小バッファサイズが採用される。

    console.log("initialized model_id = " + user_lexicon_id);

    recaiusSpeechRecognition.setConfig(
        function(ret){
            for(var key in ret){
                console.log(key +":" + ret[key]);
            }
        }, options);
}

/**
 * 録音準備.
 *
 * アラビア数字への変換が有効な場合はユーザ辞書モデルを作成してから録音へ.
 */
var prepareCapture = function(){

    //************************************************************
    //パターン１：ベースモデルから新規ユーザ辞書モデルを作成し、
    //          アラビア変換機能をオンにする。
    //************************************************************
    /*
    //チェックボックスの状態に応じてフラグを変更.
    if ( $('#js-check-use-numerials').prop('checked') ){
        //ユーザ辞書モデルの作成へ.
        createUserlexicons();
    }else{
        //ユーザ辞書モデルのIDはデフォルトの1に戻しておく.
        user_lexicon_id = 1;
        //音声録音イニシャライズ
        initialize();
        captureStart();
    }
    */

    //************************************************************
    //パターン２：既存のベースモデルのConfigurationを直接変更.
    //************************************************************
    //ベースモデル(model_id:1)の音声認識設定を更新する.
    configBaseModels(ARABIC_ON);
}

/**
 * 録音開始
 *
 * ログイン-> 成功なら録音開始
 */
var captureStart = function () {
    clearAll();

    //自動停止用カウントダウン開始
    //timerId = setTimeout(captureStop,timelimitMs);

    //1秒単位で残り録音時間を表示
    var count = 0; // 追加されていない回数
    intervalId = setInterval(function(){
        if(timelimitSec > 0){
            $('#js-recording-button').html('音声認識中:'+ timelimitSec);
            // totalResultStrに変更がないかを確認
            if(totalResultStr === totalResultStrBuff){
              count = count + 1 ;
              if(count === 2){
                if(timelimitSec < 6){
                  timelimitSec = 10;
                }
                typeResultTextTemp(totalResultStrBuff);
                totalResultStr = ''; // clear
                typeResultText("");
              }
            } else {
              count = 0;
            }
            totalResultStrBuff = totalResultStr;
        }else{
            if(totalResultStr === ''){
              typeResultText("");
              timelimitSec =  timelimitMs/1000;
              clearInterval(intervalId);
              $('#js-recording-button').removeClass('btn-warning');
              $('#js-recording-button').addClass('btn-primary');
              $('#js-recording-button').html('音声認識開始');

              captureStop();
            } else {
              timelimitSec = 10;
              typeResultTextTemp(totalResultStrBuff);
              totalResultStr = ''; // clear
              typeResultText("");
            }
        }
        timelimitSec--;
    },1000);
    // 認証APIの呼び出し
    recaiusSpeechRecognition.recognitionStart
    //コールバック用パラメータ
    var options = {};
    options["temp_result"] = true; //途中結果を受け取るかどうかを指定する。{true | false}。デフォルト:true;
    recaiusSpeechRecognition.recognitionStart(captureSuccessCallback, captureErrorCallback, options);
    $('#js-recording-button').html('音声認識中');
    $('#js-recording-button').removeClass('btn-primary');
    $('#js-recording-button').addClass('btn-warning');
    $("#js-recording-button").unbind("click");
    $("#js-recording-button").bind("click", function (e) {
        captureStop();
    });
}

var captureStop = function() {
    clearTimeout(timerId);
    clearInterval(intervalId);
    $('#js-recording-button').removeClass('btn-warning');
    $('#js-recording-button').addClass('btn-primary');
    $('#js-recording-button').html('音声認識開始');
    $('#js-text-textview-temp')[0].focus();

    //************************************************************
    //パターン１：ベースモデルから新規ユーザ辞書モデルを作成した場合は、
    //          録音後に削除する。
    //************************************************************
    //ユーザ辞書モデルの削除.
    //deleteUserlexicons();

    //************************************************************
    //パターン２：既存のベースモデルのConfigurationを直接変更.
    //          アラビア変換機能をオフにする.
    //************************************************************
    //ベースモデル(model_id:1)の音声認識設定を更新する.
    configBaseModels(ARABIC_OFF);

    recaiusSpeechRecognition.recognitionStop(stopSuccessCallback, stopErrorCallback);
}

function captureSuccessCallback(resultObj) {
    var code = resultObj["code"]; // 結果コード
    var message = resultObj["message"]; // 結果コードに対応するメッセージ
    var resultType = resultObj["result_type"]; // 認識結果の場合のみ。{TMP_RESULT:暫定結果 | RESULT:結果}
    var resultJson = resultObj["result"]; // 認識結果の場合のみ。WebAPIからのレスポンス。※参照：ASR-WebAPI_Specification.pdf 但し時間に関しては書式変換する
    var resultStr = resultObj["str"]; //
    //アプリ側での認識成功時の処理を記述

    if (code.indexOf("S00") > -1 && resultType === "TMP_RESULT" && resultJson.length > 0) {
        var tmpResultText = resultStr; //暫定結果
        if (tmpResultText) {
            typeResultText(tmpResultText);
        }

    } else if (code.indexOf("S00") > -1 && resultType === "RESULT" && resultJson.length > 0) {
        totalResultStr = totalResultStr + resultStr + "\n"; // 改行を付与
        typeResultText('');
    } else {
        //nothing to do
    }
}

function captureErrorCallback(resultObj) {
    var code = resultObj["code"]; // 結果コード
    var message = resultObj["message"]; // 結果コードに対応するメッセージ
    //アプリ側での認識成功時の処理を記述
}

function stopSuccessCallback(resultObj) {
    var code = resultObj["code"]; // 結果コード。成功の場合はSxxx。xxxは任意のコード
    var message = resultObj["message"]; // 結果コードに対応するメッセージ

    //アプリ側での認識停止成功時の処理を記述
    $('#js-recording-button').removeClass('btn-warning');
    $('#js-recording-button').addClass('btn-primary');
    $('#js-recording-button').html('音声認識開始');
    $("#js-recording-button").unbind("click");
    $("#js-recording-button").bind("click", function (e) {
        //録音準備.
        prepareCapture();
    });

}

function stopErrorCallback(resultObj){
    var code = resultObj["code"]; // 結果コード。成功の場合はSxxx。xxxは任意のコード
    var message = resultObj["message"]; // 結果コードに対応するメッセージ
    //アプリ側での認識停止成功時の処理を記述
}


/**
 * 結果を画面に表示
 */
function typeResultText(appendText) {
    $('#js-text-textview').html(totalResultStr + appendText);
    //$('#js-text-textview-temp')[0].focus();
    $('#js-text-textview').scrollTop($('#js-text-textview')[0].scrollHeight);
}


var clearAll = function () {
    totalResultStr = '';
    timelimitSec = timelimitMs/1000;
}

/**
 * ユーザ辞書モデルの作成.
 *
 * 成功 -> 漢数字からアラビア数字に変換するための更新処理へ移行.
 * 失敗 -> エラー.
 */
function createUserlexicons()
{
    console.log("speech2text : createUserlexicon in");
    recaiusSpeechRecognition.createUserLexicons(createUserlexiconsSuccessCallback, createUserlexiconsErrorCallback);
}

/**
 * ユーザ辞書モデルの作成成功時コールバック.
 *
 * result_model_id : 作成されたユーザ辞書モデルのIDが渡される.
 */
function createUserlexiconsSuccessCallback(result_model_id) {

    console.log("speech2text : createUserlexiconsSuccessCallback in");

    //ユーザ辞書モデルのIDを保存.
    user_lexicon_id = result_model_id;
    console.log("speech2text : user_lexicon_id = " + user_lexicon_id);

    //作成されたユーザ辞書モデルのアラビア数字変換機能を有効にする.
    recaiusSpeechRecognition.configUserLexicons(configUserlexiconsSuccessCallback, configUserlexiconsErrorCallback, user_lexicon_id);
}

/**
 * ユーザ辞書モデルの作成失敗時コールバック.
 *
 * result_string : エラーメッセージ.
 */
function createUserlexiconsErrorCallback(result_string){
    console.log("speech2text : createUserlexiconsErrorCallback in");
    console.log(result_string);
}

/**
 * ユーザ辞書モデルの設定更新成功時コールバック.
 *
 * result_string : 成功時メッセージ.
 */
function configUserlexiconsSuccessCallback(result_string) {
    console.log("speech2text : configUserlexiconsSuccessCallback in");
    console.log(result_string);

    //作成されたユーザ辞書モデルを使って音声認識.
    initialize();
    captureStart();
}

/**
 * ユーザ辞書モデルの更新失敗時コールバック.
 *
 * result_string : エラーメッセージ.
 */
function configUserlexiconsErrorCallback(result_string){
    console.log("speech2text : configUserlexiconsErrorCallback in");
    console.log(result_string);
}

/**
 * ユーザ辞書モデルの削除.
 *
 * 成功 -> リカイアスサーバからユーザ辞書モデルが削除される.
 * 失敗 -> エラー.
 */
function deleteUserlexicons()
{
    console.log("speech2text : deleteUserlexicons in");

    //デフォルトのモデルIDは除外(新規作成したモデルのみ削除対象).
    if ( user_lexicon_id != 1 ){
        recaiusSpeechRecognition.deleteUserLexicons(deleteUserlexiconsSuccessCallback, deleteUserlexiconsErrorCallback, user_lexicon_id);
    }
}

/**
 * ユーザ辞書モデルの削除成功時コールバック.
 *
 * result_string : エラーメッセージ.
 */
function deleteUserlexiconsSuccessCallback(result_string) {
    console.log("speech2text : deleteUserlexiconsSuccessCallback in");
    console.log(result_string);
}

/**
 * ユーザ辞書モデルの更新失敗時コールバック.
 *
 * result_string : エラーメッセージ.
 */
function deleteUserlexiconsErrorCallback(result_string){
    console.log("speech2text : deleteUserlexiconsErrorCallback in");
    console.log(result_string);
}



/**
 * ベースモデルの音声認識設定を更新.
 *
 * 成功 -> 漢数字からアラビア数字に変換するためのベースモデルに変化.
 * 失敗 -> エラー.
 */
function configBaseModels(arabic_numerals)
{
    console.log("speech2text : configBaseModels in");
    recaiusSpeechRecognition.configBaseModels(
        configBaseModelsSuccessCallback, configBaseModelsErrorCallback, base_model_id, arabic_numerals);
}

/**
 * ベースモデルの音声認識設定を更新成功時コールバック.
 *
 * result_string : 成功時メッセージ.
 */
function configBaseModelsSuccessCallback(resultObj) {

    console.log("speech2text : configBaseModelsSuccessCallback in");
    console.log(resultObj["message"]);

    //アラビア変換をオンにした場合のみ音声認識開始.
    if ( resultObj["code"] == "ARABIC_ON_SUCCESS" ){
        initialize();
        captureStart();
    }
}

/**
 * ベースモデルの音声認識設定を更新失敗時コールバック.
 *
 * result_string : エラーメッセージ.
 */
function configBaseModelsErrorCallback(result_string){
    console.log("speech2text : configBaseModelsErrorCallback in");
    console.log(result_string);
}

/** Event Listener */
$(document).ready(
    function(){
        $('#js-text-form-log').hide();

        $("#js-recording-button").bind("click",
            function(){
                //録音準備.
                prepareCapture();
            }
        );
        // AAI --------------------------------------
        // add start recognition button
        $("#js-first-run-button").bind("click",
            function(){
                //録音準備.
                prepareCapture();
                clearResultText();
            }
        );
        // send chat button
        $("#js-sending-button").bind("click",
            function(){
                //送信.
                totalResultStrTemp = $('#js-text-textview-temp').val();
                sendMessage(totalResultStrTemp);
                processAfterSend(totalResultStrTemp);
            }
        );
        // clear temporary button
        $("#js-clear-button").bind("click",
            function(){
                // temporary clear.
                totalResultStrTemp = $('#js-text-textview-temp').val();
                clearTempArea(totalResultStrTemp);
            }
        );
        // clear temporary button
        $("#js-log-button").bind("click",
            function(){
                changeButtonShow();
            }
        );

    }
 );


 // AAI -----------------------------------------------------------------
/**
 * 結果画面をclear
 */
function clearResultText() {
    $('#js-text-textview').html('');
    $('#js-text-textview').scrollTop($('#js-text-textview')[0].scrollHeight);
    //$('#js-text-textview-temp')[0].focus();
}
function changeButtonHide(){
  $('#js-text-form-log').hide();
  $("#js-log-button").bind("click", function (e) {
      changeButtonShow();
  });
};
function changeButtonShow(){
  // temporary clear.
  $('#js-text-form-log').show();
  $('#js-text-textview-log').html(totalResultStrLog);
  $("#js-log-button").bind("click", function (e) {
      changeButtonHide();
  });
  $('#js-text-textview-log')[0].focus();
};

/**
 * tempolary areaに追記する
 */
function typeResultTextTemp(buff) {
    totalResultStrTemp = $('#js-text-textview-temp').val();
    totalResultStrTemp = totalResultStrTemp + buff;
    $('#js-text-textview-temp').val(totalResultStrTemp);
}
/**
 * history division にbeforeで、elementを書き出す
 */
function typeResultTextHistDiv(sendText) {
    $('.div-display').after("<p>" + sendText + "</p>");
}

/**
 * 解析結果を、SkypeにsendするREST Serviceを呼ぶ(非同期)
 */
function sendMessage(sendText) {
  if(!sendText){
    var url = 'http://localhost:1880/Flow99';
    $.ajax(url,{
      "contentType" : 'application/json',
      "type" : 'POST' ,
      "dataType" : 'jsonp',
      "data" : {'text' : sendText},
      "success" : sendMessageSuccessCallback
    })
  }
}
function sendMessageSuccessCallback(data){
  console.log('----function:sendMessageSuccessCallback()--');
}

/**
 * 意図判定　temporary => historyに渡すtiming
 */
function callClassifyMessage(msg,botName,operationMode,meetingOpMode,translationMode){
  var url = 'http://localhost:10101/act';
  var data = {
    "msg" : msg,
    "butName" : botName,
    "operationMode" : operationMode,
    "meetingOpMode" : meetingOpMode,
    "translationMode" : translationMode
  };
  $.ajax(url,{
    "contentType" : 'application/json',
    "type" : 'POST' ,
    "dataType" : 'jsonp',
    "data" : data
  })
}

function classifySuccessCallback(data){
  console.log('----function:classifySuccessCallback()--');
}


/**
 * message send後の処理
 * totalResultStrTempをclearする
 */
function processAfterSend(textTemp){
  if(textTemp){
    typeResultTextHistDiv(totalResultStrTemp);
    totalResultStrTemp = '-----------------------\n' + totalResultStrTemp + '\n';
    totalResultStrHist = totalResultStrHist + totalResultStrTemp;
    totalResultStrLog = totalResultStrLog + totalResultStrTemp;
    //console.log(totalResultStrHist);
    totalResultStrTemp = '' ; // clear
    $('#js-text-textview-temp').val('');
    typeResultTextTemp('');
  }
}


/**
 * clear時の処理
 * totalResultStrTempをclearする
 */
function clearTempArea(textTemp){
  if(textTemp){
    totalResultStrTemp = '-----------------------\n' + totalResultStrTemp + '\n';
    totalResultStrLog = totalResultStrLog + totalResultStrTemp;
    //console.log(totalResultStrLog);
    totalResultStrTemp = '' ; // clear
    $('#js-text-textview-temp').val('');
    typeResultTextTemp('');
  }
}
