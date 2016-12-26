/*
 * @fileOverview クライアントから呼び出されるI/F実装を記述するファイルです。

 * @version β1.0.0
 *
 */
/**
 * @class Ricaius音声認識APIを利用する際に利用するクラス。<br>
 * ユーザから直接利用されるクラス。<br>
 *
 * @example 利用する際のサンプルコード<br>
 * 1.必要ファイルのインポート
 *   利用環境に応じて下記行を追加して必要なファイルを読み込むようにする。
 *   ■Cordova版を利用する場合
 *   &lt;script type=&quot;text/javascript&quot; src=&quot;./cordova.js&quot;&gt;&lt;/script&gt;
 *   &lt;script type=&quot;text/javascript&quot; src=&quot;javascripts/recaius-speech-recognition-import.js&quot;&gt;&lt;/script&gt;
 *
 *   ■WebRCT版を利用する場合
 *   &lt;script type=&quot;text/javascript&quot; src=&quot;javascripts/recaius-speech-recognition-import.js&quot;&gt;&lt;/script&gt;
 *
 * 2.設定登録
 *   下記のような関数を作成し、recaiusSpeechRecognition.setConfig()を呼び出してください。
 *   function setConfig(){
 *    var options = {};
 *    //接続用パラメータ
 *    options["host"] = "接続先ホストを指定";
 *    options["userid"] = "サービス利用IDを設定";
 *    options["password"] = "パスワードを設定";
 *    var model = {};
 *    model["model_id"] = "利用可能なモデルID";
 *    options["model"] = model;
 *    recaiusSpeechRecognition.setConfig(valitationCallback, options);
 *  }
 *
 * 3.音声認識の開始
 *  下記のような関数を作成し、recaiusSpeechRecognition.recognitionStart()を呼び出してください。
 *  function recognitionStart(){
 *    recaiusSpeechRecognition.recognitionStart(successCallback, errorCallback);
 *  }
 *
 * 4.音声認識の停止
 *  下記のような関数を作成し、recaiusSpeechRecognition.recognitionStop()を呼び出してください。
 *  function recognitionStop(){
 *    recaiusSpeechRecognition.recognitionStop(successCallback, errorCallback);
 *  }
 *
 * <label id="callbackSample">5.コールバック関数について</label>
 * 5-1.valitationCallback
 *  下記のような関数を作成し、コールバック関数として引数に指定してください。
 *  function valitationCallback(resultObj){
 *    //アプリ側での入力チェック結果取得時の処理を記述
 *    //resultObjが空の場合、入力チェックエラー無し
 *    //resultObjが空でない場合、入力チェックエラー無し
 *    //resultObj[key]=[value]
 *    //keyにパラメータ名, valueに入力チェックエラーメッセージ
 *  }
 * 5-1.successCallback
 * 5-1-1.recognitionStartの場合
 *  下記のような関数を作成し、コールバック関数として引数に指定してください。
 *  function successCallback(resultObj){
 *    var code = resultObj["code"]; // 結果コード
 *    var message = resultObj["message"]; // 結果コードに対応するメッセージ
 *    var resultType = resultObj["result_type"]; // 認識結果の場合のみ。{TMP_RESULT:暫定結果 | RESULT:結果}
 *    var resultStr = resultObj["str"]; // 認識結果の場合のみ。認識結果文字列
 *    var resultJson = resultObj["result"]; // 認識結果の場合のみ。WebAPIからのレスポンス。
 *    //アプリ側での認識成功時の処理を記述
 *  }
 *
 * 5-1-2.recognitionStopの場合
 *  下記のような関数を作成し、コールバック関数として引数に指定してください。
 *  function successCallback(resultObj){
 *    var code = resultObj["code"]; // 結果コード
 *    var message = resultObj["message"]; // 結果コードに対応するメッセージ
 *    var resultType = resultObj["result_type"]; // 認識結果の場合のみ。{TMP_RESULT:暫定結果 | RESULT:結果}
 *    var resultStr = resultObj["str"]; // 認識結果の場合のみ。認識結果文字列
 *    var resultJson = resultObj["result"]; // 認識結果の場合のみ。WebAPIからのレスポンス。
 *    //アプリ側での認識成功時の処理を記述
 *  }
 *
 * 5-2.errorCallback
 *  下記のような関数を作成し、コールバック関数として引数に指定してください。
 *  function errorCallback(resultObj){
 *    var code = resultObj["code"]; // 結果コード。エラーの場合はExxx。xxxは任意のコード
 *    var message = resultObj["message"]; // 結果コードに対応するメッセージ
 *    //アプリ側でのエラー時の処理を記述
 *  }
 *
 * <table id="codeList" class="paramTable">
 *   <caption>レスポンスに含まれる結果コード{code}一覧</caption>
 *   <tr><th class="name">種別</th><th class="name">コード</th><th class="message">メッセージ</th><th class="description">返却タイミング</th></tr>
 *   <tr><td class="center" rowspan="4">正常系</td><td class="center">S001</td><td>認識結果取得</td><td>RESULT時の認識結果取得時</td></tr>
 *   <tr><td class="center">S002</td><td>認識結果取得</td><td>TMP_RESULT時の認識結果取得時</td></tr>
 *   <tr><td class="center">S003</td><td>認識完了</td><td>NO_DATA検知時</td></tr>
 *   <tr><td class="center">S004</td><td>認識中断</td><td>NO_DATA検知待ち時でかつ<br>resultAPIへのリクエストが一定回数(5回=5秒)を超過した場合</td></tr>
 *   <tr><td class="center" rowspan="15">異常系</td><td class="center">E101</td><td>setConfig()を事前に実行してください</td><td>setConfig()を呼ばずに、recognitionStart/Stop()を実行した場合</td></tr>
 *   <tr><td class="center">E102</td><td>認識中ではありません</td><td>recognitionStart()を呼ばずに、recognitionStop()を実行した場合</td></tr>
 *   <tr><td class="center">E201</td><td>Device not ready</td><td>録音開始時に入力デバイス（マイク）の準備ができていない場合</td></tr>
 *   <tr><td class="center">E202</td><td>録音開始エラー(<i><b>message</b></i>)</td><td>CordovaPlugin内で録音開始に失敗した場合（Exception発生時）<br><i><b>message</b></i>はe.getMessage()</td></tr>
 *   <tr><td class="center">E203</td><td>録音停止エラー(<i><b>message</b></i>)</td><td>CordovaPlugin内で録音停止に失敗した場合（Exception発生時）<br><i><b>message</b></i>はe.getMessage()</td></tr>
 *   <tr><td class="center">E204</td><td>録音開始エラー(<i><b>message</b></i>)</td><td>録音開始時にCordobaPluginの呼び出しに失敗した場合<br><i><b>message</b></i>はe.message</td></tr>
 *   <tr><td class="center">E205</td><td>録音停止エラー(<i><b>message</b></i>)</td><td>録音停止時にCordobaPluginの呼び出しに失敗した場合<br><i><b>message</b></i>はe.message</td></tr>

 *   <tr><td class="center">E441</td><td>ログインエラー(<i><b>status</b></i>)</td><td>ログイン処理にてエラーが発生した場合<br><i><b>status</b></i>はWebAPIからのレスポンスコード</td></tr>
 *   <tr><td class="center">E412</td><td>ログインエラー(<i><b>name</b></i>)</td><td>ログイン処理にてエラーが発生した場合<br><i><b>name</b></i>はDOMException.name<br>例）サーバに接続できない場合は、"NetworkError"が取得できる。<br>参考:https://developer.mozilla.org/ja/docs/Web/API/DOMError</td></tr>
 *   <tr><td class="center">E421</td><td>ログアウトエラー(<i><b>status</b></i>)</td><td>ログアウト処理にてエラーが発生した場合<br><i><b>status</b></i>はWebAPIからのレスポンスコード</td></tr>
 *   <tr><td class="center">E422</td><td>ログアウトエラー(<i><b>status</b></i>)</td><td>ログアウト処理にてエラーが発生した場合<br><i><b>name</b></i>はDOMException.name</td></tr>
 *   <tr><td class="center">E431</td><td>認識結果取得エラー(<i><b>status</b></i>)</td><td>voice API実行時にてエラーが発生した場合<br><i><b>status</b></i>はWebAPIからのレスポンスコード</td></tr>
 *   <tr><td class="center">E432</td><td>認識結果取得エラー(<i><b>status</b></i>)</td><td>voice API実行時にてエラーが発生した場合<br><i><b>name</b></i>はDOMException.name</td></tr>
 *   <tr><td class="center">E441</td><td>認識結果取得エラー(<i><b>status</b></i>)</td><td>result API実行時にてエラーが発生した場合<br><i><b>status</b></i>はWebAPIからのレスポンスコード</td></tr>
 *   <tr><td class="center">E442</td><td>認識結果取得エラー(<i><b>status</b></i>)</td><td>result API実行時にてエラーが発生した場合<br><i><b>name</b></i>はDOMException.name</td></tr>
 * </table>
 */
var recaiusSpeechRecognition = (function() {
	/** 利用する実装を設定
	 * @private
	 **/
	var recaius = recaiusRecordingWebRTC || recaiusRecordingCordova;
	/**
	 * 設定関数の呼び出し有無<br>
	 * 既に呼ばれている場合はtrue, できていない場合はfalseが設定される<br>
	 * @private
	 **/
	var isSetting = false;
	/**
	 * 録音状態フラグ<br>
	 * 録音中の場合true, それ以外の場合はfalseが設定される<br>
	 * @private
	 **/
	var isRecording = false;
	/**
	 * 未確定認識結果コールバック有無<br>
	 * 未確定をコールバックする場合true, それ以外の場合はfalseが設定される<br>
	 * @private
	 **/
	var isTempResult = true;

	/**
	 * WebAPIの接続先ホストを格納
	 * @private
	 **/
	var webapiHost = "";
	/**
	 * login関数へ引き渡すoptions
	 * @private
	 **/
	var loginOptions;
	/**
	 * WebAPIから返却されるUUIDを格納
	 * @private
	 **/
	var uuid = "";
	/**
	 * setConfig時のモデル指定[model.resulttype]の”one_best”判定フラグ<br>
	 * ”one_best”又は無指定の場合はtrue, それ以外の場合はfalseが設定される<br>
	 * @private
	 **/
	var isOneBest = true;
	/**
	 * RECAIUS APIのTokenを保存
	 */
	var token = "";
	/**
	 * flush処理の正否を保存
	 */
	var flush_status = "";
	/**
	 * ユーザ辞書モデルのID(デフォルト1).
	 */
	var user_lexicon_id = 1;
	/**
	 * Tokenを取得するためのURL
	 */
	var API_TOKENS = "/tokens"
	/**
	 * ログインAPIのURL
	 * @private
	 **/
	var API_LOGIN = "/voices";
	/**
	 * ログアウトAPIのURL
	 * @private
	 **/
	var API_LOGOUT = "/voices/{uuid}";
	/**
	 * 音声認識用APIのURL
	 * @private
	 **/
	var API_VOICE = "/voices/{uuid}";
	/**
	 * 音声認識結果APIのURL
	 * @private
	 **/
	var API_RESULT = "/voices/{uuid}/results";
	/**
	 * すべての音声データを送信済みURL
	 * @private
	 */
	var API_FLUSH = "/voices/{uuid}/flush";
	/**
	 * ユーザ辞書作成URL
	 * @private
	 */
	var API_USERLEXICONS = "/userlexicons";
	/**
	 * ベースモデル操作URL
	 * @private
	 */
	var API_BASE_MODELS = "/models";
	/**
	 * UUIDを変換する際の対象文字列
	 * @private
	 **/
	var REPLACE_TARGET = "{uuid}";

	/**
	 * 音声データIDのリクエストパラメータ名
	 * @private
	 **/
	var RK_VOICEID = "voiceid";
	/**
	 * 音声データのリクエストパラメータ名
	 * @private
	 **/
	var RK_VOICE = "voice";
	/**
	 * 音声認識用APIのvoicceidカウンタ
	 * @private
	 **/
	var voiceCnt = 1;

	/**
	 * クライアントから引き渡された認識開始Successコールバック関数を格納
	 * @private
	 **/
	var clientStartSuccessCallback;
	/**
	 * クライアントから引き渡された認識開始Errorコールバック関数を格納
	 * @private
	 **/
	var clientStartErrorCallback;

	/**
	 * クライアントから引き渡された認識停止Successコールバック関数を格納
	 * @private
	 **/
	var clientStopSuccessCallback;
	/**
	 * クライアントから引き渡された認識停止Errorコールバック関数を格納
	 * @private
	 **/
	var clientStopErrorCallback;

	/**
	 * Result取得時のインターバル時間(ミリ秒)
	 * @private
	 **/
	var intervalTime = 1000;
	/**
	 * Result取得時の回数
	 * @private
	 **/
	var resultCounter = 0;
	/**
	 * Result取得時の最大試行回数
	 * @private
	 **/
	var MAX_RESULT_COUNT = 5;
	/**
	 * VoiceAPIでの連続エラーカウント
	 * @private
	 **/
	var voiceApiErrCnt = 0;

	/**
	 * API利用に必要な設定する<br>
	 * @param {function} validateCallback コールバック関数。コールバック関数に関しては<a href="#callbackSample">サンプルコード参照</a>
	 * @param {連想配列} options パラメータを格納したオブジェクト
	 * <table class="paramTable">
	 *   <caption>options</caption>
	 *   <tr><th class="name">キー</th><th class="necessary">必須</th><th class="type">型</th><th class="default">許容値</th><th class="description">概要</th></tr>
	 *   <tr><td>host</td><td class="center">○</td><td class="center">String</td><td class="center"></td><td>接続先ホストを指定します。</td></tr>
	 *   <tr><td>id</td><td class="center">○</td><td class="center">String</td><td class="center"></td><td>サービス利用IDを指定します。</td></tr>
	 *   <tr><td>password</td><td class="center">○</td><td class="center">String</td><td class="center"></td><td>パスワードを指定します。</td></tr>
	 *   <tr><td>temp_result</td><td class="center">－</td><td class="center">boolean</td><td class="center">{true | false}</td><td>未確定結果取得時にコールバック関数の呼び出し有無を指定します。</td></tr>
	 *   <tr><td>buffer_time</td><td class="center">－</td><td class="center">int</td><td class="center"></td><td>一回あたりの録音バッファ(ミリ秒)を指定します。<br>Cordova版では最小値:256, 最大値2000。<br>範囲外の値は最小最大値が適用される。<br>入力値と8の最小公倍数に調整される。</td></tr>
	 *   <tr><td>model</td><td class="center">○</td><td class="center">連想配列</td><td class="center"></td><td><a href="#modelList">model</a>参照</td></tr>
	 *   <tr><td>format</td><td class="center">－</td><td class="center">連想配列</td><td class="center"></td><td><a href="#formatList">format</a> 参照</td></tr>
	 * </table>
	 * <br>
	 * <table id="modelList" class="paramTable">
	 *   <caption>model</caption>
	 *   <tr><th class="name">キー</th><th class="necessary">必須</th><th class="type">型</th><th class="default">許容値</th><th class="description">概要</th></tr>
	 *   <tr><td>audiotype</td><td class="center">－</td><td class="center">String</td><td class="center">audio/x-linear</td><td>音声種別を指定します。</td></tr>
	 *   <tr><td>energy_threshold</td><td class="center">－</td><td class="center">int</td><td class="center">0～1000</td><td>音声と判断する音量のレベルを指定します。<br>指定範囲外の値を指定すると無効になります。</td></tr>
	 *   <tr><td>resulttype</td><td class="center">－</td><td class="center">String</td><td class="center">{nbest | one_best | confnet}</td><td>認識結果の型を指定します。<br>不正な値を指定した場合はHTTPレスポンス400が返ります。</td></tr>
	 *   <tr><td>resultcount</td><td class="center">－</td><td class="center">int</td><td class="center">1～10</td><td>認識結果の候補が取得できる数を指定します。<br>本値はresulttypeが”one_best”の場合は無効です。<br>1より小さい値を指定した場合は1に、10より大きい値を指定した場合は10に設定されます。</td></tr>
	 *   <tr><td>model_id</td><td class="center">○</td><td class="center">int</td><td class="center"></td><td>音声認識に使用するモデルIDを指定します。<br>ベースモデルまたはユーザ単語辞書付きモデルのいずれかを指定します。<br>不正な値を指定した場合はHTTPレスポンス400が返ります。</td></tr>
	 *   <tr><td>pushtotalk</td><td class="center">－</td><td class="center">boolean</td><td class="center">false</td><td>Push-to-Talkモードにするか否かを指定します。</td></tr>
	 *   <tr><td>datalog</td><td class="center">－</td><td class="center">int</td><td class="center">{0 | 1}</td><td>認識する音声データを保存するか否かを指定します。<br>0の時は保存せず、1の時に保存します。<br>※本値は、契約時に音声データを保存する契約を交わした場合のみ有効です。<br>0より小さい値を指定した場合は0に、1より大きい値を指定した場合は1に設定されます。</td></tr>
	 *   <tr><td>comment</td><td class="center">－</td><td class="center">String</td><td class="center">1024文字以内</td><td>サーバーに保存する音声データに付与するコメントです。<br>任意の文字列を1024文字まで格納できます。<br>1024文字を超えた場合はHTTPレスポンス400が返ります。</td></tr>
	 * </table>
	 * <br>
	 * <table id="formatList" class="paramTable">
	 *   <caption>format</caption>
	 *   <tr><th class="name">キー</th><th class="necessary">必須</th><th class="type">型</th><th class="default">許容値</th><th class="description">概要</th></tr>
	 *   <tr><td>audio_source</td><td class="center">－</td><td class="center">int</td><td class="center">1</td><td>録音時の入力ソースを指定します。</td></tr>
	 *   <tr><td>sampling_rate</td><td class="center">－</td><td class="center">int</td><td class="center">16,000</td><td>録音時のサンプリングレートを指定します。</td></tr>
	 *   <tr><td>channel</td><td class="center">－</td><td class="center">int</td><td class="center">16</td><td>録音時のチャンネル数を指定します。</td></tr>
	 *   <tr><td>audio_format</td><td class="center">－</td><td class="center">int</td><td class="center">2</td><td>録音時のフォーマットを指定します。</td></tr>
	 * </table>
	 *
	 * @throws コールバック関数が指定されていない場合にスロー
	 *
	 */
	function setConfig(validateCallback, options){
		if ('function' !== typeof validateCallback){
			throw new Error("コールバック関数が指定されていません");
			return;
		}
		var validErr = validator(options);
		// 初期化処理実行(受け取った引数を全て渡す)
		var orgValidErr = recaius.initialize(options);
		validErr = recaiusUtils.merge(validErr, orgValidErr);
		if(Object.keys(validErr).length == 0){
			// 引数の調整
			webapiHost = options["host"];
			delete options["host"];
			isTempResult = new Boolean(options["temp_result"]);
			delete options["temp_result"];
			delete options["buffer_time"];
			delete options["format"];
			loginOptions = options;
			isSetting = true;
			var resulttype = options["model"]["result_type"];
			if(!recaiusUtils.isEmpty(resulttype) && resulttype !== "one_best"){
				isOneBest = false;
			}else{
				isOneBest = true;
			}
		}
		try{
			validateCallback(validErr);
		}catch(e){
			recaiusUtils.debug("Error in validateCallback function::" + e.message);
		}
	}

	/**
	 * 入力チェックを実施する
	 * @param {連想配列} options パラメータを格納したオブジェクト
	 * @see setConfig options
	 * @private
	 */
	function validator(options){
		var retVal = {};
		// options["host"] 必須
		var chkTarget = options["host"];
		if(recaiusUtils.isEmpty(chkTarget)){
			retVal["host"] = "必須入力です";
		}
		chkTarget = options["model"];
		if(recaiusUtils.isEmpty(chkTarget)){
			retVal["model.model_id"] = "必須入力です";
		}else{
			chkTarget = options["model"]["model_id"];
			if(recaiusUtils.isEmpty(chkTarget) || !Number.isFinite(chkTarget)){
				retVal["model.model_id"] = "必須入力又は数値のみ指定可能です";
			}
			// options["model"]["audiotype"] audio/x-linearのみ
			chkTarget = options["model"]["audiotype"];
			if(!recaiusUtils.isEmpty(chkTarget) && chkTarget !== "audio/x-linear"){
				retVal["model.audiotype"] = "\"audio/x-linear\"のみ指定可能です";
			}
			// options["model"]["pushtotalk"] falseのみ
			chkTarget = options["model"]["pushtotalk"];
			if(!recaiusUtils.isEmpty(chkTarget) && chkTarget !== false){
				retVal["model.pushtotalk"] = "falseのみ指定可能です";
			}
		}
		chkTarget = options["format"];
		if(!recaiusUtils.isEmpty(chkTarget)){
			// options["format"]["audio_source"] 数値, 1のみ
			chkTarget = options["format"]["audio_source"];
			if(!recaiusUtils.isEmpty(chkTarget) && (Number.isFinite(chkTarget) && chkTarget !== 1)){
				retVal["format.audio_source"] = "1(数値)のみ指定可能です";
			}
			// options["format"]["sampling_rate"] 数値, 2のみ
			chkTarget = options["format"]["sampling_rate"];
			if(!recaiusUtils.isEmpty(chkTarget) && (Number.isFinite(chkTarget) && chkTarget !== 16000)){
				retVal["format.sampling_rate"] = "16000(数値)のみ指定可能です";
			}
			// options["format"]["channel"] 数値, 16のみ
			chkTarget = options["format"]["channel"];
			if(!recaiusUtils.isEmpty(chkTarget) && (Number.isFinite(chkTarget) && chkTarget !== 16)){
				retVal["format.channel"] = "16(数値)のみ指定可能です";
			}
			// options["format"]["audio_format"] 数値, 2のみ
			chkTarget = options["format"]["audio_format"];
			if(!recaiusUtils.isEmpty(chkTarget) && (Number.isFinite(chkTarget) && chkTarget !== 2)){
				retVal["format.audio_format"] = "2(数値)のみ指定可能です";
			}
		}
		return retVal;
	}
	/**
	 * 認証APIを呼び出してRECAIUSのアクセストークンを取得する
	 *
	 */
	function tokens(){
		recaiusUtils.debug("call tokens api");
		// 接続先URLの設定
		var tokensOption = '/api/token'
		recaiusUtils.debug("url = " + tokensOption);
		// リクエスト実行
		recaius.tokens(tokensSuccess, tokensError, tokensOption);

		if(token){
			return true;
		}
		return false;
	}

	/**
	 * ログイン処理をする<br>
	 * isSettingがfalseの場合、エラーコールバックが呼び出される。<br>
	 * @private
	 * @return trueの場合、ログイン成功又は既にログイン済み。falseの場合、ログイン処理失敗
	 */
	function login(){
		recaiusUtils.debug("call login = [" + uuid + "]");
		voiceCnt = 1;
		voiceApiErrCnt = 0;
		if(uuid){
			// 既にUUIDが発行済みの場合はログイン処理をスルー
			// TODO 本来はSessionタイムアウトの問題があるためUUIDの有無のみではNG
			// APIへの最終アクセス時間又は確認用APIがあればそれを利用する方が望ましい
			// 今回は常に音声送信が発生するためSessionタイムアウトは発生しないはず？
			return true;
		}
		// 接続先URLの設定
		loginOptions["url"] = getUrl("login");
		loginOptions["token"] = token;
		recaiusUtils.debug("url = " + loginOptions["url"]);
		// リクエスト実行
		recaius.login(loginSuccess, loginError, loginOptions);
		if(uuid){
			return true;
		}
		return false;
	}
	/**
	 * フラッシュ処理を行う（音声データ送信完了処理を行う）
	 *
	 */
	function flush() {
		recaiusUtils.debug("call login = [" + uuid + "]");
		// 接続先URLの設定
		var flushOptions = {};
		flushOptions["url"] = getUrl("flush");
		flushOptions["token"] = token;
		flushOptions["voice_id"] = voiceCnt;
		recaiusUtils.debug("url = " + flushOptions["url"]);
		recaiusUtils.debug("voiceCnt = " + flushOptions["voice_id"]);
		// リクエスト実行
		recaius.flush(flushSuccess, flushError, flushOptions);
		if(flush_status === 200 || flush_status === 204){
			return true;
		}
		return false;
	}

	/**
	 * ログアウト処理をする<br>
	 * @private
	 */
	function logout(){

		recaiusUtils.debug("call logout");
		var options = {};
		options["url"] = '/api/voice-recognition/voices/' + uuid + '/logout?token=' + token;
		recaiusUtils.debug("url = " + options["url"]);
		recaius.logout(logoutSuccess, logoutError, options);
	}


	/**
	 * 音声認識を開始する<br>
	 * ■処理概要<br>
	 * 1.（ログインしていない場合のみ）ログイン処理をする<br>
	 * 2.録音開始処理をする<br>
	 * 3.音声認識処理をする<br><br>
	 *
	 * @param {function} successCallback 成功時のコールバック関数。コールバック関数に関しては<a href="#callbackSample">サンプルコード参照</a>
	 * @param {function} errorCallback 失敗時のコールバック関数。コールバック関数に関しては<a href="#callbackSample">サンプルコード参照</a>
	 *
	 * @return レスポンスデータを格納した{連想配列}
	 * <table class="paramTable">
	 *   <caption>返却される{連想配列}</caption>
	 *   <tr><th class="name">キー</th><th class="type">型</th><th class="necessary">設定有無</th><th class="description">概要</th></tr>
	 *   <tr><td>code</td><td class="center">String</td><td class="center">常時</td><td>レスポンスコード<br>詳細は<a href="#codeList">コード一覧</a>参照</td></tr>
	 *   <tr><td>message</td><td class="center">String</td><td class="center">常時</td><td>レスポンスメッセージ<br>詳細は<a href="#codeList">コード一覧</a>参照</td></tr>
	 *   <tr><td>result_type</td><td class="center">String</td><td class="center">認識結果有の場合のみ</td><td>暫定結果の場合、”TMP_RESULT”<br>確定結果の場合、”RESULT”</td></tr>
	 *   <tr><td>str</td><td class="center">String</td><td class="center">認識結果有の場合のみ</td><td>認識結果文字列</td></tr>
	 *   <tr><td>result</td><td class="center">{連想配列}</td><td class="center">認識結果有の場合のみ</td><td>WebAPIから返却された認識結果の配列</td></tr>
	 * </table>
	 *
	 * @throws コールバック関数が指定されていない場合にスロー
	 **/
	function recognitionStart(successCallback, errorCallback){
		if (! tokens()){
			throw new Error("Tokenが正常に取得できません");
			return;
		}
		recaiusUtils.debug("call recognitionStart");
		clientStartSuccessCallback = successCallback;
		clientStartErrorCallback = errorCallback;
		if ('function' !== typeof successCallback || 'function' !== typeof errorCallback){
			throw new Error("コールバック関数が指定されていません");
			return;
		}
		if(!isSetting){
			try{
				clientStartErrorCallback(createResponseData("E101", "setConfig()を事前に実行してください"));
			}catch(e){
				recaiusUtils.debug("Error in errorCallback function::" + e.message);
			}
			return;
		}
		if(login() && !isRecording){
			isRecording = true;
			recaius.recordingStart(recordingStartSuccess, recordingStartError);
		}
	}

	/**
	 * 音声認識を停止する<br>
	 * ■処理概要<br>
	 * 1.録音停止処理をする<br>
	 * 2.ログアウト処理をする<br>
	 *
	 * @param {function} successCallback 成功時のコールバック関数。コールバック関数に関しては<a href="#callbackSample">サンプルコード参照</a>
	 * @param {function} errorCallback 失敗時のコールバック関数。コールバック関数に関しては<a href="#callbackSample">サンプルコード参照</a>
	 *
	 * @return レスポンスデータを格納した{連想配列}
	 * <table class="paramTable">
	 *   <caption>返却される{連想配列}</caption>
	 *   <tr><th class="name">キー</th><th class="type">型</th><th class="necessary">設定有無</th><th class="description">概要</th></tr>
	 *   <tr><td>code</td><td class="center">String</td><td class="center">常時</td><td>レスポンスコード<br>詳細は<a href="#codeList">コード一覧</a>参照</td></tr>
	 *   <tr><td>message</td><td class="center">String</td><td class="center">常時</td><td>レスポンスメッセージ<br>詳細は<a href="#codeList">コード一覧</a>参照</td></tr>
	 *   <tr><td>result_type</td><td class="center">String</td><td class="center">認識結果有の場合のみ</td><td>暫定結果の場合、”TMP_RESULT”<br>確定結果の場合、”RESULT”</td></tr>
	 *   <tr><td>str</td><td class="center">String</td><td class="center">認識結果有の場合のみ</td><td>認識結果文字列</td></tr>
	 *   <tr><td>result</td><td class="center">{連想配列}</td><td class="center">認識結果有の場合のみ</td><td>WebAPIから返却された認識結果の配列</td></tr>
	 * </table>
	 *
	 * @throws コールバック関数が指定されていない場合にスロー
	 **/
	function recognitionStop(successCallback, errorCallback){
		recaiusUtils.debug("call recognitionStop");
		if ('function' !== typeof successCallback || 'function' !== typeof errorCallback){
			throw new Error("コールバック関数が指定されていません");
			return;
		}
		if(!isSetting){
			try{
				errorCallback(createResponseData("E101", "setConfig()を事前に実行してください"));
			}catch(e){
				recaiusUtils.debug("Error in errorCallback function::" + e.message);
			}
			return;
		}
		if(!isRecording){
			try{
				errorCallback(createResponseData("E102", "認識中ではありません"));
			}catch(e){
				recaiusUtils.debug("Error in errorCallback function::" + e.message);
			}
			return;
		}
		clientStopSuccessCallback = successCallback;
		clientStopErrorCallback = errorCallback;
		// 録音停止
		recaius.recordingStop(recordingStopSuccess, recordingStopError);
	}

	/**
	 * 認識取得結果に含まれている時間情報(ミリ秒)をHHMMSSMS形式に変換する<br>
	 * 変換に失敗した場合は、時間情報はミリ秒のまま
	 *
	 * @param item 認識結果
	 * @private
	 */
	function convertTimeFormat(item){
		try{
			item.result.forEach(function(resultElm){
				resultElm.words.forEach(function(elm){
					elm.begin = recaiusUtils.convertMillTime2HHMMSSMS(elm.begin);
					elm.end = recaiusUtils.convertMillTime2HHMMSSMS(elm.end);
				});
			});
		}catch(e){
			// エラー時は未変換のまま
		}
	}

	/**
	 * 最終結果取得処理<br>
	 * result APIを呼び出す
	 *
	 * @param {String} url 接続先URL
	 * @private
	 */
	function getResult(url){
		recaiusUtils.debug("call getResult");
			recaiusUtils.requestApi("GET", url, null, "", true,
				function(obj){
					recaiusUtils.debug("resultApiSuccess");
					if(obj.target.response){
						recaiusUtils.debug(obj.target.response);
						var json = JSON.parse(obj.target.response);
						//recaiusUtils.debug(JSON.stringify(json, null, '\t'));
						var result;
						var temp_result;
						var isStop;
						if(!isOneBest){
							// one_best以外の場合の処理
							result = json.filter(function (item, index) {if (item.type === "RESULT"){convertTimeFormat(item);return true;}});
							temp_result = json.filter(function (item, index) {if (item.type === "TMP_RESULT") return true;});
							isStop = json.filter(function (item, index) {if (item.type === "NO_DATA") return true});
						}else{
							// one_bestの場合の処理
							// レスポンス形式が異なるので注意
							result = json.filter(function (item, index) {if (item.indexOf("RESULT") != -1){return true;}});
							temp_result = json.filter(function (item, index) {if (item.indexOf("TMP_RESULT") != -1){return true;}});
							isStop = json.filter(function (item, index) {if (item.indexOf("NO_DATA") != -1){return true;}});
						}
						var result_type = "";
						if(result.length>0){
							result_type = "RESULT";
						}else if(temp_result.length>0){
							result_type = "TMP_RESULT";
							result = temp_result;
						}
						try{
							if(result_type === "RESULT"){
								clientStopSuccessCallback(createResponseData("S001", "認識結果取得", result_type, result));
							}else if(isTempResult && result_type === "TMP_RESULT"){
								clientStopSuccessCallback(createResponseData("S002", "認識結果取得", result_type, result));
							}
						}catch(e){
							recaiusUtils.debug("Error in successCallback function::" + e.message);
						}
						console.log("isStop.length = " + isStop.length);
						if(isStop.length>0){
							// [NO_DATA]があったら終了
							recaiusUtils.debug("認識処理を終了します。");
							try{
								clientStopSuccessCallback(createResponseData("S003", "認識完了", result_type, result));
							}catch(e){
								recaiusUtils.debug("Error in successCallback function::" + e.message);
							}
							// ログアウト
							logout();
						}else{
							resultCounter++;
							console.log("resultCounter = " + resultCounter);
							// 5回（1秒×5回）で強制終了
							if (resultCounter >= MAX_RESULT_COUNT) {
								recaiusUtils.debug("認識処理を中断します。");
								try{
									clientStopSuccessCallback(createResponseData("S004", "認識中断", result_type, result));
								}catch(e){
									recaiusUtils.debug("Error in successCallback function::" + e.message);
								}
								logout();
							}else{
								setTimeout(getResult(url), intervalTime);
							}
						}
					}else{
						// voice側でNO_DATAが返却される場合こちらにくる
						recaiusUtils.debug("認識処理を終了します。");
						try{
							clientStopSuccessCallback(createResponseData("S003", "認識完了", result_type, result));
						}catch(e){
							recaiusUtils.debug("Error in successCallback function::" + e.message);
						}
						// ログアウト
						logout();
					}
				},
				function(obj){
					recaiusUtils.debug("resultApiError");
					var code = "E441";
					var message = "認識結果取得エラー";
					if(obj instanceof DOMException || obj instanceof XMLHttpRequestException){
						code = "E442";
						message += "(" + obj.name + ")";
					}else if(obj instanceof XMLHttpRequestProgressEvent){
						message += "(" + obj.target.status + ")";
					}
					try{
						clientStopErrorCallback(createResponseData(code, message));
					}catch(e){
						recaiusUtils.debug("Error in errorCallback function::" + e.message);
					}
					logout();
				});
	}

	/**
	 * Tokensの呼び出しに成功してTokenが取得できた時のコールバック関数
	 */
	function tokensSuccess(obj){
		recaiusUtils.debug(obj);
		token = obj.currentTarget.responseText;
		recaiusUtils.debug("tokens = " + token);
	}
	/**
	 * Tokensの呼び出しに失敗してTokenが取得できなかった時のコールバック関数
	 */
	function tokensError(obj){
		recaiusUtils.debug("tokensError");
		recaiusUtils.debug(obj);
		var code = "E401";
		var message = "トークン取得エラー";
		if(obj instanceof DOMException || obj instanceof XMLHttpRequestException){
			code = "E412";
			message += "(" + obj.name + ")";
		}else if(obj instanceof XMLHttpRequestProgressEvent){
			message += "(" + obj.target.status + ")";
		}
		try{
			clientStartErrorCallback(createResponseData(code , message));
		}catch(e){
			recaiusUtils.debug("Error in errorCallback function::" + e.message);
		}
	}

	/**
	 * ログインAPI成功時のコールバック関数<br>
	 * @private
	 * @param {XMLHttpRequestProgressEvent} obj レスポンス
	 */
	function loginSuccess(obj){
		// ログイン成功時に返却されるUUIDを確保する
		recaiusUtils.debug(obj);
		uuid = obj.currentTarget.responseText;
		recaiusUtils.debug("uuid = " + uuid);
	}

	/**
	 * ログインAPI失敗時のコールバック関数<br>
	 * エラー内容を生成し、クライアント側から指定されているコールバックを呼び出す。
	 * @private
	 * @param {DOMException | XMLHttpRequestException | XMLHttpRequestProgressEvent} obj レスポンス
	 */
	function loginError(obj){
		recaiusUtils.debug("loginError");
		recaiusUtils.debug(obj);
		var code = "E411";
		var message = "ログインエラー";
		if(obj instanceof DOMException || obj instanceof XMLHttpRequestException){
			code = "E412";
			message += "(" + obj.name + ")";
		}else if(obj instanceof XMLHttpRequestProgressEvent){
			message += "(" + obj.target.status + ")";
		}
		try{
			clientStartErrorCallback(createResponseData(code , message));
		}catch(e){
			recaiusUtils.debug("Error in errorCallback function::" + e.message);
		}
	}

	/**
	 * Flushの呼び出しに成功した時のコールバック関数
	 */
	function flushSuccess(obj){
		recaiusUtils.debug(obj);
		flush_status = obj.currentTarget.status;
		recaiusUtils.debug("flush = " + flush_status);
	}
	/**
	 * Flushの呼び出しに失敗した時のコールバック関数
	 */
	function flushError(obj){
		recaiusUtils.debug("flushError");
		recaiusUtils.debug(obj);
		var code = "E451";
		var message = "flush処理エラー";
		if(obj instanceof DOMException || obj instanceof XMLHttpRequestException){
			code = "E452";
			message += "(" + obj.name + ")";
		}else if(obj instanceof XMLHttpRequestProgressEvent){
			message += "(" + obj.target.status + ")";
		}
		try{
			clientStartErrorCallback(createResponseData(code , message));
		}catch(e){
			recaiusUtils.debug("Error in errorCallback function::" + e.message);
		}
	}

	/**
	 * ログアウトAPI成功時のコールバック関数
	 * @private
	 * @param {XMLHttpRequestProgressEvent} obj レスポンス
	 */
	function logoutSuccess(obj){
		// ログアウト成功時にUUIDをクリアする
		recaiusUtils.debug(obj);
		// 初期化
		uuid = "";
		voiceCnt = 1
		resultCounter = 0;
		voiceApiErrCnt = 0;
		recaiusUtils.debug("[uuid][voiceCnt][resultCounter]=[" + uuid + "][" + voiceCnt + "][" + resultCounter + "]");

		$.ajax({
			url: '/api/token/' + token,
			method: 'DELETE'
		}).done(function() {
			token = null;
			console.log('Token delete success');
		});
	}

	/**
	 * ログアウトAPI失敗時のコールバック関数<br>
	 * エラー内容を生成し、クライアント側から指定されているコールバックを呼び出す。
	 * @private
	 * @param {DOMException | XMLHttpRequestException | XMLHttpRequestProgressEvent} obj レスポンス
	 */
	function logoutError(obj){
		recaiusUtils.debug("logoutError");
		var code = "E421";
		var message = "ログアウトエラー";
		if(obj instanceof DOMException || obj instanceof XMLHttpRequestException){
			code = "E422";
			message += "(" + obj.name + ")";
		}else if(obj instanceof XMLHttpRequestProgressEvent){
			message += "(" + obj.target.status + ")";
		}
		try{
			clientStopErrorCallback(createResponseData(code , message));
		}catch(e){
			recaiusUtils.debug("Error in errorCallback function::" + e.message);
		}
	}

	/**
	 * 録音処理成功時のコールバック関数<br>
	 * 引数で受け取ったBLOBデータをWebAPIへPUTする。
	 * @private
	 * @param {BLOB|ArrayBuffer} 送信する音声データ
	 */
	function recordingStartSuccess(obj){
		recaiusUtils.debug("recordingSuccess");
		// 接続先URLの取得
		var url = getUrl("voice");
		recaiusUtils.debug("[url][voiceid]=[" + url + "][" + voiceCnt + "]");
		var header = {};
		header["cType"] = "";
		// console.log(token);
		// header["xToken"] = token;
		if(obj instanceof Blob){
			// リクエストパラメータ設定
			var formData = new FormData();
			formData.append("token",token); 
			formData.append(RK_VOICEID, voiceCnt);
			formData.append(RK_VOICE, obj);

			//BLOBの場合はcTypeは未設定とする(FormData側で自動設定されるため)
			// リクエスト実行
			recaiusUtils.requestApi("PUT", url, header, formData, true, voiceApiSuccess, voiceApiError);
		}else if (obj instanceof ArrayBuffer){
			var boundary = recaiusUtils.createBoundary();
			cType = "multipart/form-data; boundary=" + boundary;
			var buffer = recaiusUtils.unicode2buffer('--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="voiceid"\r\n\r\n'
											+ voiceCnt + '\r\n'
											+ '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="voice";filename="cordovaTest.wav"\r\n'
											+ 'Content-Type: audio/wav\r\n\r\n');
			buffer = recaiusUtils.appendBuffer(buffer, obj);
			buffer = recaiusUtils.appendBuffer(buffer , recaiusUtils.unicode2buffer('\r\n' + '--' + boundary + '--'));
            // リクエスト実行
    		recaiusUtils.requestApi("PUT", url, header, buffer, true, voiceApiSuccess, voiceApiError);
		}
		voiceCnt++;
	}

	/**
	 * 録音処理失敗時のコールバック関数<br>
	 * エラーを設定し、クライアント側のエラーコールバックを呼び出す
	 * @private
	 * @param {String} code レスポンスコード 詳細は<a href="#codeList">コード一覧</a>参照
	 * @param {String} msg レスポンスメッセージ 詳細は<a href="#codeList">コード一覧</a>参照
	 */
	// 音声録音失敗時の処理
	function recordingStartError(code, message){
		recaiusUtils.debug("recordingStartError(" + code + ", " + message + ")");
		isRecording = false;
		try{
			clientStartErrorCallback(createResponseData(code, message));
		}catch(e){
			recaiusUtils.debug("Error in errorCallback function::" + e.message);
		}
	}

	/**
	 * 録音停止処理成功時のコールバック関数<br>
	 * 成功情報を設定し、クライアント側のコールバックを呼び出す
	 * @private
	 * @param {String} code レスポンスコード 詳細は<a href="#codeList">コード一覧</a>参照
	 * @param {String} msg レスポンスメッセージ 詳細は<a href="#codeList">コード一覧</a>参照
	 */
	function recordingStopSuccess(code, message){
		recaiusUtils.debug("recordingStopSuccess(" + code + ", " + message + ")");
		isRecording = false;
		try{
			clientStopSuccessCallback(createResponseData(code, message));
		}catch(e){
			recaiusUtils.debug("Error in successCallback function::" + e.message);
		}
		// API側へ音声データ終了のデータ(0byte音声データを送信)
		// ArrayBufferではサーバ側が受信できていない模様 ---->
		// var stopArray = new ArrayBuffer(0);
		//var stopArray = createBlobOrArrayBuffer();
		// ArrayBufferではサーバ側が受信できていない模様 <----
		// recordingStartSuccess(stopArray);

		// flushをしてすべてのデータを取得
		flush();

		// 接続先URLの取得
		var url = '/api/voice-recognition/voices/' + uuid + '/results?token=' + token;
		recaiusUtils.debug("result url = " + url);
		resultCounter = 0;
		setTimeout(getResult(url), intervalTime);
	}

	/**
	 * 音声認識停止失敗時のコールバック関数<br>
	 * 失敗情報を設定し、クライアント側のコールバックを呼び出す
	 * @private
	 * @param {String} code レスポンスコード 詳細は<a href="#codeList">コード一覧</a>参照
	 * @param {String} msg レスポンスメッセージ 詳細は<a href="#codeList">コード一覧</a>参照
	 */
	function recordingStopError(code, message){
		recaiusUtils.debug("recognitionStopError(" + code + ", " + message + ")");
		try{
			clientStopErrorCallback(createResponseData(code, message));
		}catch(e){
			recaiusUtils.debug("Error in errorCallback function::" + e.message);
		}

		// API側へ音声データ終了のデータ(0byte音声データを送信)
		// ArrayBufferではサーバ側が受信できていない模様 ---->
		//var stopArray = new ArrayBuffer(0);
		// var stopArray = createBlobOrArrayBuffer();
		// ArrayBufferではサーバ側が受信できていない模様 <----
		// recordingStartSuccess(stopArray);

		// flushをしてすべてのデータを取得
		flush();
		// 接続先URLの取得
		var url = '/api/voice-recognition/voices/' + uuid + '/results?token=' + token;
		recaiusUtils.debug("result url = " + url);
		resultCounter = 0;
		setTimeout(getResult(url), intervalTime);
	}

	/**
	 * 認識終了用の0Byteデータを作成する<br>
	 * 1.BLOBにて作成<br>
	 * 2.BLOBがサポートされていない場合（Android4.4以下）、BlobBuilderにて作成<br>
	 * 3.BlobBuilderがサポートされていない場合、ArrayBufferにて作成<br>
	 * <br>
	 * <label class="attention">(注)ArrayBufferの場合、サーバ側で受信できないとの報告あり</label>
	 *
	 * @return 作成したBLOB又はArrayBufferオブジェクト
	 * @private
	 */
	function createBlobOrArrayBuffer() {
		var bytes = new Uint8Array(0);
		var retBlob;
		try {
			retBlob = new Blob([bytes], {type: "audio/wav"});
		} catch(e) {
			recaiusUtils.debug("new BOLB not support.");
			window.BlobBuilder = window.BlobBuilder ||
			window.WebKitBlobBuilder ||
			window.MozBlobBuilder ||
			window.MSBBlobBuilder;
			if(e.name == "TypeError" && window.BlobBuilder) {
				//Android4.4以下の対応
				var blobBuilder = new BlobBuilder();
				blobBuilder.append(bytes.buffer);
				retBlob = blobBuilder.getBlob("audio/wav");
			} else {
				recaiusUtils.debug("window.BlobBuilder not support.");
				// どうしてもNGだったらArrayBufferで作成
				retBlob = new ArrayBuffer(bytes.buffer);
			}
			// どうしてもNGだったらArrayBufferで作成
			retBlob = new ArrayBuffer(bytes.buffer);
		}
		if(retBlob instanceof Blob){
			recaiusUtils.debug("blob[size][type]=[" + retBlob.size + "][" + retBlob.type + "]");
		}else if (retBlob instanceof ArrayBuffer){
			recaiusUtils.debug("arrayBuffer[byteLength]=[" + retBlob.byteLength + "]");
		}
		return retBlob;
	}

	/**
	 * VoiceAPI実行成功時の処理<br>
	 * 返却データを作成し、クライアント側のコールバック関数を呼び出す。<br>
	 *
	 * @param {XMLHttpRequestProgressEvent} obj レスポンス
	 *
	 * @private
	 **/
	function voiceApiSuccess(obj){
		recaiusUtils.debug("voiceApiSuccess voiceApiErrCnt = " + voiceApiErrCnt);
		if(voiceApiErrCnt < 5){
			// TODO:返却データを成形する処理が必要
			if(obj.target.response){
				//VoiceAPIのエラーカウンタ初期化
				voiceApiErrCnt = 0;
				recaiusUtils.debug(obj.target.response);
				var json = JSON.parse(obj.target.response);
				//recaiusUtils.debug(JSON.stringify(json, null, '\t'));
				var result;
				var temp_result;
				if(!isOneBest){
					// one_best以外の場合の処理
					result = json.filter(function (item, index) {if (item.type === "RESULT"){convertTimeFormat(item);return true;}});
					temp_result = json.filter(function (item, index) {if (item.type === "TMP_RESULT") return true;});
				}else{
					// one_bestの場合の処理
					// レスポンス形式が異なるので注意
					result = json.filter(function (item, index) {if (item.indexOf("RESULT") != -1){return true;}});
					temp_result = json.filter(function (item, index) {if (item.indexOf("TMP_RESULT") != -1){return true;}});
				}
				var result_type = "";
				if(result.length>0){
					result_type = "RESULT";
				}else if(temp_result.length>0){
					result_type = "TMP_RESULT";
					result = temp_result;
				}
				try{
					if(result_type === "RESULT"){
						clientStartSuccessCallback(createResponseData("S001", "認識結果取得", result_type, result));

					}else if(isTempResult && result_type === "TMP_RESULT"){
						clientStartSuccessCallback(createResponseData("S002", "認識結果取得", result_type, result));
					}
				}catch(e){
					recaiusUtils.debug("Error in successCallback function::" + e.message);
				}
	        }
		}
	}

	/**
	 * VoiceAPI実行失敗時の処理<br>
	 * 返却データを作成し、クライアント側のコールバック関数を呼び出す。<br>
	 *
	 * @private
	 * @param {DOMException | XMLHttpRequestException | XMLHttpRequestProgressEvent} obj レスポンス
	 **/
	function voiceApiError(obj){
		recaiusUtils.debug("voiceApiError()");
		recaiusUtils.debug(obj);
		var code = "431";
		var message = "認識結果取得エラー";
		if(obj instanceof DOMException || obj instanceof XMLHttpRequestException){
			code = "432";
			message += "(" + obj.name + ")";
		}else if(obj instanceof XMLHttpRequestProgressEvent){
			message += "(" + obj.target.status + ")";
		}
		if(voiceApiErrCnt < 5){
			try{
				clientStartErrorCallback(createResponseData(code , message));
			}catch(e){
				recaiusUtils.debug("Error in errorCallback function.::" + e.message);
			}
		}else if (voiceApiErrCnt == 5){
			// 連続でVoiceAPIエラー検知のため録音停止→ログアウト
			// コールバック関数がStart用しかないためStrat用を設定
			recognitionStop(clientStartSuccessCallback, clientStartErrorCallback);
		}
		//VoiceAPIのエラーカウンタアップ
		voiceApiErrCnt++;
	}

	/**
	 * ユーザ辞書モデルを新規で作成する<br>
	 * 成功した場合は作成されたモデルのIDをクライアント側の成功時コールバックへ返す.<br>
	 **/
	function createUserLexicons(successCallback, errorCallback)
	{
		console.log("recaius-speech-recognition : createUserLexicons in");

		if (! tokens()){
			throw new Error("Tokenが正常に取得できません");
			return;
		}

		clientStartSuccessCallback = successCallback;
		clientStartErrorCallback = errorCallback;
		if ('function' !== typeof successCallback || 'function' !== typeof errorCallback){
			throw new Error("コールバック関数が指定されていません");
			return;
		}

		loginOptions = {};
		loginOptions["url"] = getUrl("userlexicons");
		loginOptions["token"] = token;

		//ベースモデルは1で固定.
		loginOptions["base_model_id"] = 1;
		
		//ユーザ辞書モデル新規作成API呼び出し.
		recaius.createUserLexicons(createUserLexiconsSuccess, createUserLexiconsError, loginOptions);
	}

	/**
	 * ユーザ辞書モデル作成成功時のコールバック<br>
	 * 作成されたモデルのIDをクライアント側の成功時コールバックへ返す.<br>
	 **/
	function createUserLexiconsSuccess(obj){
		console.log("recaius-speech-recognition : createUserLexiconsSuccess in");

		//作成されたモデルIDを抽出.
		var json = JSON.parse(obj.target.response);
		user_lexicon_id = json["model_id"];

		//クライアントへ返す.
		clientStartSuccessCallback(user_lexicon_id);
	}

	/**
	 * ユーザ辞書モデル作成失敗時のコールバック<br>
	 * エラーメッセージをクライアント側の失敗時コールバックへ返す.<br>
	 **/
	function createUserLexiconsError(code, message){
		console.log("createUserLexiconsError in");

		clientStartErrorCallback(createResponseData("ERR", "ユーザ辞書モデルが生成できませんでした。"));
	}

	/**
	 * ユーザ辞書モデルの音声認識設定を更新する<br>
	 * (今回は漢数字をアラビア数字へ変換する機能を有効にするのみ).
	 **/
	function configUserLexicons(successCallback, errorCallback, userlexiconId)
	{
		console.log("recaius-speech-recognition : configUserLexicons in");

		if (! tokens()){
			throw new Error("Tokenが正常に取得できません");
			return;
		}

		clientStartSuccessCallback = successCallback;
		clientStartErrorCallback = errorCallback;
		if ('function' !== typeof successCallback || 'function' !== typeof errorCallback){
			throw new Error("コールバック関数が指定されていません");
			return;
		}

		loginOptions = {};
		loginOptions["url"] = getUrl("userlexicons") + "/" + userlexiconId + "/configuration";
		loginOptions["token"] = token;
		
		//音声認識設定の更新API呼び出し.
		recaius.configUserLexicons(configUserLexiconsSuccess, configUserLexiconsError, loginOptions);
	}

	/**
	 * 音声認識設定の更新成功時のコールバック<br>
	 **/
	function configUserLexiconsSuccess(obj){
		console.log("recaius-speech-recognition : configUserLexiconsSuccess in");
		clientStartSuccessCallback(createResponseData("SUCCEESS", "ユーザ辞書モデルを更新しました。"));
	}

	/**
	 * 音声認識設定の更新失敗時のコールバック<br>
	 **/
	function configUserLexiconsError(code, message){
		console.log("recaius-speech-recognition : configUserLexiconsError in");
		clientStartErrorCallback(createResponseData("ERR", "ユーザ辞書モデルを更新できませんでした。"));
	}

	/**
	 * ユーザ辞書モデルを削除する<br>
	 **/
	function deleteUserLexicons(successCallback, errorCallback, userlexiconId)
	{
		console.log("recaius-speech-recognition : deleteUserLexicons in");

		if (! tokens()){
			throw new Error("Tokenが正常に取得できません");
			return;
		}

		clientStartSuccessCallback = successCallback;
		clientStartErrorCallback = errorCallback;
		if ('function' !== typeof successCallback || 'function' !== typeof errorCallback){
			throw new Error("コールバック関数が指定されていません");
			return;
		}

		loginOptions = {};
		loginOptions["url"] = getUrl("userlexicons") + "/" + userlexiconId;
		loginOptions["token"] = token;
		
		//ユーザ辞書削除APIの呼び出し.
		recaius.deleteUserLexicons(deleteUserLexiconsSuccess, deleteUserLexiconsError, loginOptions);
	}

	/**
	 * ユーザ辞書モデル削除成功時のコールバック<br>
	 **/
	function deleteUserLexiconsSuccess(obj){
		console.log("recaius-speech-recognition : deleteUserLexiconsSuccess in");
		clientStartSuccessCallback(createResponseData("SUCCEESS", "ユーザ辞書モデルを削除しました。"));
	}

	/**
	 * ユーザ辞書モデル削除失敗時のコールバック<br>
	 **/
	function deleteUserLexiconsError(code, message){
		console.log("recaius-speech-recognition : deleteUserLexiconsError in");
		clientStartErrorCallback(createResponseData("ERR", "ユーザ辞書モデルが削除できませんでした。"));
	}

	/**
	 * ベースモデルの音声認識設定を更新する<br>
	 * (今回は漢数字をアラビア数字へ変換する機能を有効にするのみ).<br>
	 **/
	function configBaseModels(successCallback, errorCallback, baseModelId, arabic_numerals)
	{
		console.log("recaius-speech-recognition : configBaseModels in");

		if (! tokens()){
			throw new Error("Tokenが正常に取得できません");
			return;
		}

		clientStartSuccessCallback = successCallback;
		clientStartErrorCallback = errorCallback;
		if ('function' !== typeof successCallback || 'function' !== typeof errorCallback){
			throw new Error("コールバック関数が指定されていません");
			return;
		}

		loginOptions = {};

		//model_id:1で固定.
		loginOptions["url"] = getUrl("base_models") + "/" + baseModelId + "/configuration";
		loginOptions["token"] = token;

		//アラビア変換機能を付与.
		loginOptions["arabic_numerals"] = arabic_numerals;
		
		//ユーザ辞書モデル新規作成API呼び出し.
		recaius.configBaseModels(configBaseModelsSuccess, configBaseModelsError, loginOptions);
	}

	/**
	 * ベースモデルの音声認識設定成功時のコールバック<br>
	 **/
	function configBaseModelsSuccess(obj){
		console.log("recaius-speech-recognition : configBaseModelsSuccess in");

		//作成されたデータを抽出.
		var json = JSON.parse(obj.target.response);

		var code = "";
		//クライアントへ返す.
		if ( json["arabic_numerals"] == 1 ){
			clientStartSuccessCallback(createResponseData("ARABIC_ON_SUCCESS", 
				"arabic_numerals = 1 => ベースモデルのアラビア変換機能をオンにしました。"));
		}else{
			clientStartSuccessCallback(createResponseData("ARABIC_OFF_SUCCESS", 
				"arabic_numerals = 0 => ベースモデルのアラビア変換機能をオフにしました。"));
		}
	}

	/**
	 * ベースモデルの音声認識設定失敗時のコールバック<br>
	 * エラーメッセージをクライアント側の失敗時コールバックへ返す.<br>
	 **/
	function configBaseModelsError(code, message){
		console.log("configBaseModelsError in");

		clientStartErrorCallback(createResponseData("ERR", "ベースモデルの音声認識設定を更新できませんでした。"));
	}

	/**
	 * 返却するためのレスポンスデータを作成する
	 * @private
	 *
	 * @param {String} code レスポンスコード 詳細は<a href="#codeList">コード一覧</a>参照
	 * @param {String} message レスポンスメッセージ 詳細は<a href="#codeList">コード一覧</a>参照
	 * @param {String} result_type 認識結果の場合のみ。{TMP_RESULT:暫定結果 | RESULT:結果}
	 * @param {連想配列} result 認識結果の場合のみ。WebAPIから返却された認識結果の配列
	 *
	 * @return レスポンスデータを格納した{連想配列}
	 * <table class="paramTable">
	 *   <caption>返却される{連想配列}</caption>
	 *   <tr><th class="name">キー</th><th class="type">型</th><th class="necessary">設定有無</th><th class="description">概要</th></tr>
	 *   <tr><td>code</td><td class="center">String</td><td class="center">常時</td><td>レスポンスコード<br>詳細は<a href="#codeList">コード一覧</a>参照</td></tr>
	 *   <tr><td>message</td><td class="center">String</td><td class="center">常時</td><td>レスポンスメッセージ<br>詳細は<a href="#codeList">コード一覧</a>参照</td></tr>
	 *   <tr><td>result_type</td><td class="center">String</td><td class="center">認識結果有の場合のみ</td><td>暫定結果の場合、”TMP_RESULT”<br>確定結果の場合、”RESULT”</td></tr>
	 *   <tr><td>str</td><td class="center">String</td><td class="center">認識結果有の場合のみ</td><td>認識結果文字列</td></tr>
	 *   <tr><td>result</td><td class="center">{連想配列}</td><td class="center">認識結果有の場合のみ</td><td>WebAPIから返却された認識結果の配列</td></tr>
	 * </table>
	 */
	function createResponseData(code, message, resultType, resultJson){
		recaiusUtils.debug("createResponseData(" + code +", " + message + "," + resultType + ", resultJson) Enter");
		var resData = {};
		resData["code"] = code;
		resData["message"] = message;
		if(resultType){
			resData["result_type"] = resultType;
		}
		if(resultJson && resultJson.length > 0){
			resData["result"] = resultJson;
			if(!isOneBest){
				if(resultType === "RESULT"){
					resData["str"] = resultJson[resultJson.length - 1].result[0].str;
				}else{
					var tmpResult = resultJson.filter(function (item, index) { if (item.type === "TMP_RESULT") return true });
					var resultOne = tmpResult[tmpResult.length - 1];
					if(resultOne){
						resData["str"] = resultOne.result;
			        }
				}
			}else{
				if(resultType === "RESULT"){
					resData["str"] = resultJson[resultJson.length - 1][1];
				}else if(resultType === "TMP_RESULT"){
					resData["str"] = resultJson[resultJson.length - 1][1];
				}
			}
		}
		//recaiusUtils.debug(resData);
		return resData;
	}

	/**
	 * 指定された引数に応じてWebAPIへの接続先URLを取得する。
	 * @private
	 * @param {String} type 次のいずれかを指定<br>login:ログインAPIのURLを取得 |<br>
	 *   logout:ログアウトAPIのURLを取得 |<br>
	 *   voice:認識APIのURLを取得 |<br>
	 *   result:結果取得APIのURLを取得
	 *
	 */
	function getUrl(type){
		if(type === "login"){
			return webapiHost + API_LOGIN;
		}else if(type === "logout"){
			return webapiHost + API_LOGOUT.replace(REPLACE_TARGET, uuid);
		}else if(type === "voice"){
			return webapiHost + API_VOICE.replace(REPLACE_TARGET, uuid);
		}else if(type === "result"){
			return webapiHost + API_RESULT.replace(REPLACE_TARGET, uuid);
		}else if(type === "flush"){
			return webapiHost + API_FLUSH.replace(REPLACE_TARGET, uuid);
		}else if(type === "tokens"){
			return webapiHost + API_TOKENS;
		}else if(type === "userlexicons"){
			return "/api" + API_USERLEXICONS;
		}else if(type === "base_models"){
			return "/api" + API_BASE_MODELS;
		}
	}
	// 公開関数
	return {
		setConfig: setConfig,
		recognitionStart: recognitionStart,
		recognitionStop: recognitionStop,
		createUserLexicons: createUserLexicons,
		deleteUserLexicons: deleteUserLexicons,
		configUserLexicons: configUserLexicons,
		configBaseModels: configBaseModels
	}
})();
