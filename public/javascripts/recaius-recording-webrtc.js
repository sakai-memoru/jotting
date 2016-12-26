/* global Recorder */
var recaiusRecordingCordova;


/*
 * @fileOverview WebRTCを利用した音声録音ロジッククラス
 *
 */
/**
 * @class WebRTCを利用した音声録音ロジッククラス<br>
 * recaiusSpeechRecognitionクラスからの呼び出されるクラス。<br>
 * ■公開関数<br>
 * ・initialize:初期化処理をする<br>
 * ・recordingStart:録音開始<br>
 * ・recordingStop:録音停止<br>
 *
 */
var recaiusRecordingWebRTC = (function () {
    var audioContext = null;
    var recorder = null;
    var recordingOptions = null;
    //ベンダプリフィックス吸収してgetUserMediaを取得
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (!navigator.getUserMedia) {
        alert("WebRTC is not supported.");
        return;
    }

	/**
	 * 初期化処理を実行する<br><br>
	 */
    function initialize(options) {
        recaiusUtils.debug("call recaiusRecordingWebRTC.initialize");
        audioContext = new AudioContext();
        recordingOptions = options;

    }
    /**
     * tokenを取得する
     */
    function tokens(successCallback, errorCallback, options){
        recaiusUtils.debug("call recaiusRecordingWebRTC.tokens");
		// 接続先URLの取得
		var url = options;
		// JSON文字列へ変換
		var jsonText = "";
        // リクエスト実行
        recaiusUtils.requestApi("GET", url,"application/json", jsonText, false, successCallback, errorCallback);
    }
	/**
	 * ログイン処理をする<br>
	 * isSettingがfalseの場合、エラーコールバックが呼び出される。<br>
	 *
	 * @return trueの場合、ログイン成功又は既にログイン済み。falseの場合、ログイン処理失敗
	 */
    function login(successCallback, errorCallback, options) {
        recaiusUtils.debug("call recaiusRecordingWebRTC.login");
		// 接続先URLの取得
		var url = options["url"]
		delete options["url"];
		// JSON文字列へ変換
		var jsonText = JSON.stringify(options);
        var header ={};
        header['cType'] = "application/json";
        delete options["token"];
        // リクエスト実行
        recaiusUtils.requestApi("POST", url, header, jsonText, false, successCallback, errorCallback);
    }

    /**
     * ログアウト前にすべて音声データを送信したこと明示するためのflushを実施
     */
    function flush(successCallback, errorCallback, options) {
        recaiusUtils.debug("call recaiusRecordingWebRTC.flush");
		// 接続先URLの取得
		var url = options['url'];
        delete options["url"];
		// JSON文字列へ変換
		var jsonText = JSON.stringify(options);
                var header ={};
        header['cType'] = "application/json";

        // リクエスト実行
        recaiusUtils.requestApi("PUT", url, header, jsonText, false, successCallback, errorCallback);
    }

	/**
	 * ログアウト処理をする<br>
	 */
    function logout(successCallback, errorCallback, options) {
        recaiusUtils.debug("call recaiusRecordingWebRTC.logout");
        // 接続先URLの取得
        var url = options["url"]
        recaiusUtils.requestApi("DELETE", url, null, "", false, successCallback, errorCallback);
    }

	/**
	 * 録音を開始する<br>
	 * コールバック関数に引き渡される返却値は成功時はBLOB<br>
	 * 失敗時は、コード及びメッセージ<br>
	 *
	 * @param successCallback 成功時のコールバック関数。recaiusSpeechRecognition.recordingStartSuccessを指定する。
	 * @param errorCallback 失敗時のコールバック関数。recaiusSpeechRecognition.recordingStartErrorを指定する。
	 * @param options 録音関連情報を指定する引数<br>
	 * options =<br>
	 * {<br>
	 *   "buffer_time":音声データのバッファサイズを設定(ミリ秒)を指定する。必要な最小バッファサイズ以下の場合、最小バッファサイズが採用される。<br>
	 * }
	 *
	 **/
    function recordingStart(successCallback, errorCallback) {
        recaiusUtils.debug("call recaiusRecordingWebRTC.recordingStart");
        //APIへ送信する1データあたりの音声時間(ms)
        var bufferTime = recordingOptions["buffer_time"] || 512;


        //WebRTCを使ってマイクから音声を取得
        navigator.getUserMedia({ video: false, audio: true }, function (stream) {

            var input = audioContext.createMediaStreamSource(stream);

            //レコーダーの初期化
            recorder = new Recorder(input,
                { workerPath: 'javascripts/recorderWorker.js',
                  bufferTime: bufferTime
                }
            );
            recorder && recorder.record(successCallback,errorCallback);

        }, function () {
            errorCallback("E301","Mic access error!");
            return;
        });

    }

    /**
     * ユーザ辞書モデルを新規で作成する<br>
     * 成功した場合は作成されたモデルのIDをクライアント側の成功時コールバックへ返す.<br>
     **/
    function createUserLexicons(successCallback, errorCallback, options) {
        recaiusUtils.debug("recaius-recording-webrtc : createUserLexicons in");

        // 接続先URLの取得
        var url = options["url"]
        delete options["url"];
        // JSON文字列へ変換
        var jsonText = JSON.stringify(options);
        var header ={};
        header['cType'] = "application/json";
        
        delete options["token"];
        // リクエスト実行
        recaiusUtils.requestApi("POST", url, header, jsonText, false, successCallback, errorCallback);
    }

    /**
     * ユーザ辞書モデルの音声認識設定を更新する<br>
     * (今回は漢数字をアラビア数字へ変換する機能を有効にするのみ).
     **/
    function configUserLexicons(successCallback, errorCallback, options) {
        recaiusUtils.debug("recaius-recording-webrtc : deleteUserLexicons in");

        // 接続先URLの取得
        var url = options["url"]
        delete options["url"];
        // JSON文字列へ変換
        var jsonText = JSON.stringify(options);
        var header ={};
        header['cType'] = "application/json";
        
        delete options["token"];
        // リクエスト実行
        recaiusUtils.requestApi("PUT", url, header, jsonText, false, successCallback, errorCallback);
    }

    /**
     * ユーザ辞書モデルを削除する<br>
     **/
    function deleteUserLexicons(successCallback, errorCallback, options) {
        recaiusUtils.debug("recaius-recording-webrtc : deleteUserLexicons in");

        // 接続先URLの取得
        var url = options["url"]
        delete options["url"];
        // JSON文字列へ変換
        var jsonText = JSON.stringify(options);
        var header ={};
        header['cType'] = "application/json";
        
        delete options["token"];
        // リクエスト実行
        recaiusUtils.requestApi("DELETE", url, header, jsonText, false, successCallback, errorCallback);
    }


    /**
     * ベースモデルの音声認識設定を更新する<br>
     **/
    function configBaseModels(successCallback, errorCallback, options) {
        recaiusUtils.debug("recaius-recording-webrtc : configBaseModels in");

        // 接続先URLの取得
        var url = options["url"]
        delete options["url"];
        // JSON文字列へ変換
        var jsonText = JSON.stringify(options);
        var header ={};
        header['cType'] = "application/json";
        
        delete options["token"];
        // リクエスト実行
        recaiusUtils.requestApi("PUT", url, header, jsonText, false, successCallback, errorCallback);
    }

	/**
	 * 録音を停止する<br>
	 * コールバック関数に引き渡される返却値はコード及びメッセージ<br>
	 *
	 * @param successCallback 成功時のコールバック関数。recaiusSpeechRecognition.recordingStopSuccessを指定する。
	 * @param errorCallback 失敗時のコールバック関数。recaiusSpeechRecognition.recordingStopErrorを指定する。
	 *
	 **/
    function recordingStop(successCallback, errorCallback) {
        recaiusUtils.debug("call recaiusRecordingWebRTC.recordingStop");
        recorder && recorder.stop();
        recorder && recorder.clear();

        successCallback({code:"S005",message:"録音が停止しました"});
    }

    // 公開API
    return {
        initialize: initialize,
        tokens: tokens,
        login: login,
        flush: flush,
        logout: logout,
        recordingStart: recordingStart,
        recordingStop: recordingStop,
        createUserLexicons: createUserLexicons,
        deleteUserLexicons: deleteUserLexicons,
        configUserLexicons: configUserLexicons,
        configBaseModels: configBaseModels
    }
})();
