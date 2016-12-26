var recaiusRecordingWebRTC;
/*
 * @fileOverview CordovaPluginを利用した音声録音ロジッククラス
 *
 */
/**
 * @class CordovaPluginを利用した音声録音ロジッククラス<br>
 * recaiusSpeechRecognitionクラスからの呼び出されるクラス。<br>
 * 本クラスを利用する場合は、別途CordovaPlugin(※1)が必要となります。<br>
 * (※1)recaius-recording-cordova-plugin<br>
 * 本ライブラリを利用するCordovaプロジェクトの設定(config.xml)にプラグイン用設定を追加する事により、端末側で入力音声をファイルへ出力する事が可能です。<br>
 * 設定については、プラグインのREADME.mdを参照して下さい。
 *
 * @version 1.0.0
 * ■公開関数<br>
 * ・initialize:初期化処理をする<br>
 * ・recordingStart:録音開始<br>
 * ・recordingStop:録音停止<br>
 *
 */
var recaiusRecordingCordova = (function() {
	/**
	 * デバイス状態フラグ<br>
	 * デバイス準備ができた場合はtrue, できていない場合はfalseが設定される<br>
	 */
	var isDeviceReady = false;

	/**
	 * 初期化処理を実行する<br><br>
	 * deviceready検出用のイベント登録関数を呼び出す<br>
	 */
	function initialize() {
		recaiusUtils.debug("call recaiusRecordingCordova.initialize");
		document.addEventListener('deviceready', onDeviceReady, false);
	}

	/**
	 * devicereadyイベント発生時に呼び出される関数<br>
	 * デバイス状態をtrueに設定する<br>
	 */
	function onDeviceReady() {
		recaiusUtils.debug("call recaiusRecordingCordova.onDeviceReady");
		isDeviceReady = true;
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
	 *
	 * @param {function} successCallback ログイン成功時に呼び出されるコールバック関数を指定する
	 * @param {function} errorCallback ログイン失敗時に呼び出されるコールバック関数を指定する
	 * @param {連想配列} options ログインURL及びログインパラメータを格納した配列を指定する
	 * <table class="paramTable">
	 *   <caption>options</caption>
	 *   <tr><th class="name">キー</th><th class="necessary">必須</th><th class="type">型</th><th class="default">許容値</th><th class="description">概要</th></tr>
	 *   <tr><td>host</td><td class="center">○</td><td class="center">String</td><td class="center"></td><td>接続先ホストを指定します。</td></tr>
	 *   <tr><td>id</td><td class="center">○</td><td class="center">String</td><td class="center"></td><td>サービス利用IDを指定します。</td></tr>
	 *   <tr><td>password</td><td class="center">○</td><td class="center">String</td><td class="center"></td><td>パスワードを指定します。</td></tr>
	 *   <tr><td>model</td><td class="center">○</td><td class="center">連想配列</td><td class="center"></td><td><a href="#modelList">model</a>参照</td></tr>
	 * </table>
	 * <br>
	 * <table id="modelList" class="paramTable">
	 *   <caption>model</caption>
	 *   <tr><th class="name">キー</th><th class="necessary">必須</th><th class="type">型</th><th class="default">許容値</th><th class="description">概要</th></tr>
	 *   <tr><td>audiotype</td><td class="center">－</td><td class="center">String</td><td class="center">audio/x-linear</td><td>音声種別を指定します。<br>本versionでは、audio/x-linear又は無指定のみ受け付けてます。</td></tr>
	 *   <tr><td>energy_threshold</td><td class="center">－</td><td class="center">int</td><td class="center">0～1000</td><td>音声と判断する音量のレベルを指定します。<br>指定範囲外の値を指定すると無効になります。</td></tr>
	 *   <tr><td>resulttype</td><td class="center">－</td><td class="center">String</td><td class="center">{nbest | one_best | confnet}</td><td>認識結果の型を指定します。<br>推奨値はnbestです。<br>不正な値を指定した場合はエラーコードE411が返却されます。</td></tr>
	 *   <tr><td>resultcount</td><td class="center">－</td><td class="center">int</td><td class="center">1～10</td><td>認識結果の候補が取得できる数を指定します。<br>本値はresulttypeが”one_best”の場合は無効です。<br>推奨値は1です。<br>1より小さい値を指定した場合は1に、10より大きい値を指定した場合は10に設定されます。</td></tr>
	 *   <tr><td>model_id</td><td class="center">○</td><td class="center">int</td><td class="center"></td><td>音声認識に使用するモデルIDを指定します。<br>ベースモデルまたはユーザ単語辞書付きモデルのいずれかを指定します。<br>不正な値を指定した場合はエラーコードE411が返却されます。</td></tr>
	 *   <tr><td>pushtotalk</td><td class="center">－</td><td class="center">boolean</td><td class="center">false</td><td>Push-to-Talkモードにするか否かを指定します。<br>本versionでは、false又は無指定のみ受け付けてます。</td></tr>
	 *   <tr><td>datalog</td><td class="center">－</td><td class="center">int</td><td class="center">{0 | 1}</td><td>認識する音声データを保存するか否かを指定します。<br>0の時は保存せず、1の時に保存します。<br>※本値は、契約時に音声データを保存する契約を交わした場合のみ有効です。<br>0より小さい値を指定した場合は0に、1より大きい値を指定した場合は1に設定されます。</td></tr>
	 *   <tr><td>comment</td><td class="center">－</td><td class="center">String</td><td class="center">1024文字以内</td><td>サーバーに保存する音声データに付与するコメントです。<br>任意の文字列を1024文字まで格納できます。<br>1024文字を超えた場合はエラーコードE411が返却されます。</td></tr>
	 * </table>
	 *
	 * @see recaiusSpeechRecognition loginSuccess関数
	 * @see recaiusSpeechRecognition loginError関数
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
	 *
	 * @param {function} successCallback ログアウト成功時に呼び出されるコールバック関数を指定する
	 * @param {function} errorCallback ログアウト失敗時に呼び出されるコールバック関数を指定する
	 * @param {連想配列} options ログアウトURLを格納した配列を指定する
	 * <table class="paramTable">
	 *   <caption>options</caption>
	 *   <tr><th class="name">キー</th><th class="necessary">必須</th><th class="type">型</th><th class="default">許容値</th><th class="description">概要</th></tr>
	 *   <tr><td>url</td><td class="center">○</td><td class="center">String</td><td class="center"></td><td>接続先URL</td></tr>
	 * </table>
	 *
	 * @see recaiusSpeechRecognition logoutSuccess関数
	 * @see recaiusSpeechRecognition logoutError関数
	 */
	function logout(successCallback, errorCallback, options){
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
	function recordingStart(successCallback, errorCallback, options){
		recaiusUtils.debug("call recaiusRecordingCordova.recordingStart");
		if(!isDeviceReady){
			errorCallback("E802", "Device情報が読み込めていません。");
			return;
		}
		try{
			cordova.exec(function(byteArray) {
				recaiusUtils.debug("call recStart success");
				recaiusUtils.debug("len=[" + byteArray.byteLength + "][" + byteArray + "]");
				successCallback(byteArray);
			},
			function(message) {
				recaiusUtils.debug("call recStart error");
				recaiusUtils.debug(message);
				errorCallback("E80X", message);
			},
			'RecaiusRecordingPlugin', 'recordingStart', [options]);
    	        }catch(e){
    	                 recaiusUtils.debug("call recStart Exception " + e);
    	        }
	}

	/**
	 * 録音を停止する<br>
	 * コールバック関数に引き渡される返却値はコード及びメッセージ<br>
	 *
	 * @param successCallback 成功時のコールバック関数。recaiusSpeechRecognition.recordingStopSuccessを指定する。
	 * @param errorCallback 失敗時のコールバック関数。recaiusSpeechRecognition.recordingStopErrorを指定する。
	 *
	 **/
	function recordingStop(successCallback, errorCallback){
		recaiusUtils.debug("call recaiusRecordingCordova.recordingStop");
		try{
			cordova.exec(function(message) {
				recaiusUtils.debug("call recStop success");
				recaiusUtils.debug(message);
				successCallback("S00X", message);
			},
			function(message) {
				recaiusUtils.debug("call recStop error");
				recaiusUtils.debug(message);
				errorCallback("E80X", message);
			},
			'RecaiusRecordingPlugin', 'recordingStop', []);
    	        }catch(e){
    	                recaiusUtils.debug("call recStart Exception " + e);
    	        }
	}

	// 公開API
	return {
		initialize: initialize,
		login: login,
		logout: logout,
		recordingStart: recordingStart,
		recordingStop: recordingStop,
	}
})();
