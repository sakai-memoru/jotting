/**
 * @class Ricaius音声認識APIを利用する際に必要なJavaScriptファイルをインポートするためのクラス。<br>
 * ユーザからは本ファイルを読み込んで頂く<br>
 * @example 利用環境に応じて下記行を追加して必要なファイルを読み込むようにする。
 *   ■Cordova版を利用する場合
 *   &lt;script type=&quot;text/javascript&quot; src=&quot;./cordova.js&quot;&gt;&lt;/script&gt;
 *   &lt;script type=&quot;text/javascript&quot; src=&quot;javascripts/recaius-speech-recognition-import.js&quot;&gt;&lt;/script&gt;
 *
 *   ■WebRCT版を利用する場合
 *   &lt;script type=&quot;text/javascript&quot; src=&quot;javascripts/recaius-speech-recognition-import.js&quot;&gt;&lt;/script&gt;
 *
 * @version 1.0.0
 */
var recaiusSpeechRecognitionImport = (function() {
	/**
	 * 環境に応じて必要なJavaScriptファイルを読み込む。
	 * @todo navigator.getUserMediaでの判定にしているが、モバイルでも取得できる可能性があるため要検討
	 */
	function importJS(){
		var hasGetUserMedia = !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		if (! new Array().push) return false;
		var scripts;
		// 先にCordova利用可能かを判定
		if (typeof(cordova) !== "undefined") {
			scripts = new Array(
					'javascripts/recaius-utils.js',
					'javascripts/recaius-recording-cordova.js',
					'javascripts/recaius-speech-recognition.js'
				);
		}else if(hasGetUserMedia){
			scripts = new Array(
					'javascripts/recaius-utils.js',
					'javascripts/recaius-recording-webrtc.js',
					'javascripts/recaius-speech-recognition.js'
				);
		}else{
			alert("※動作未対応の環境でご覧になっています※\n\n音声認識のデモは、以下の環境でのみ動作致します。\n・PC/Macでは、ChromeおよびFireFoxブラウザとマイク環境\n・Android ver.6以上では、Chromeブラウザとマイク環境\n\nご参考情報（開発者の方へ）:\nサンプルライブラリは、以下があります。\n・上記動作をするJavaScriptのサンプルライブラリ\n・この他、Android 4.xで動作するCordova用JavaScriptのサンプルライブラリ");
			return;
		}
		for (var i=0; i<scripts.length; i++) {
			document.write('<script type="text/javascript" src="' +scripts[i] + '"><\/script>');
		}
	}
	return {
		import: importJS
	};
}());
recaiusSpeechRecognitionImport.import();
