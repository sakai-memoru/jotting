/*
 * @fileOverview ユーティリティクラス
 *
 * @class ユーティリティクラス
 * @version 1.0.0
 */
var recaiusUtils = (function () {
	var debugFlag = true;

	/**
	 * 引数で指定されたObjectが空{null, undefine, ""}かどうか判定する
	 * @param {Object} val チェック対象
	 * @return 空の場合true, それ以外の場合false
	 */
	function isEmpty(val) {
		if (!val) {
			if (!((val === 0) || (val === false))) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 連想配列をマージする。
	 */
	function merge() {
		var args = Array.prototype.slice.call(arguments),
			len = args.length,
			ret = {},
			itm;
		for (var i = 0; i < len; i++) {
			var arg = args[i];
			for (itm in arg) {
				if (arg.hasOwnProperty(itm))
					ret[itm] = arg[itm];
			}
		}
		return ret;
	}

	/**
	 * XMLHttpRequestオブジェクト生成
	 * @return XMLHttpRequestオブジェクト 生成されなかった場合はnull
	 */
	function createHttpRequest() {
		//Win ie用
		if (window.ActiveXObject) {
			try {
				//MSXML2
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					//MSXML
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e2) {
					return null;
				}
			}
		} else if (window.XMLHttpRequest) {
			//Win ie以外
			return new XMLHttpRequest();
		} else {
			return null;
		}
	}

	/**
	 * マルチパートフォームデータ送信用のBoundaryを生成する
	 * @return 生成したBoundary文字列
	 */
	function createBoundary() {
		var multipartChars = "-_1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var length = 30 + Math.floor(Math.random() * 10);
		var boundary = "---------------------------";
		for (var i = 0; i < length; i++) {
			boundary += multipartChars.charAt(Math.floor(Math.random() * multipartChars.length));
		}
		return boundary;
	}

	/**
	 * 引数で受け取った文字列をBufferに変更する
	 * @param {String} str 変換対象も文字列
	 * @return 生成したbuffer
	 */
	function unicode2buffer(str) {
		var n = str.length,
			idx = -1,
			byteLength = 512,
			bytes = new Uint8Array(byteLength),
			i, c, _bytes;

		for (i = 0; i < n; ++i) {
			c = str.charCodeAt(i);
			if (c <= 0x7F) {
				bytes[++idx] = c;
			} else if (c <= 0x7FF) {
				bytes[++idx] = 0xC0 | (c >>> 6);
				bytes[++idx] = 0x80 | (c & 0x3F);
			} else if (c <= 0xFFFF) {
				bytes[++idx] = 0xE0 | (c >>> 12);
				bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
				bytes[++idx] = 0x80 | (c & 0x3F);
			} else {
				bytes[++idx] = 0xF0 | (c >>> 18);
				bytes[++idx] = 0x80 | ((c >>> 12) & 0x3F);
				bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
				bytes[++idx] = 0x80 | (c & 0x3F);
			}
			if (byteLength - idx <= 4) {
				_bytes = bytes;
				byteLength *= 2;
				bytes = new Uint8Array(byteLength);
				bytes.set(_bytes);
			}
		}
		idx++;
		var result = new Uint8Array(idx);
		result.set(bytes.subarray(0, idx), 0);
		return result.buffer;
	}

	/**
	 * 引数で受け取ったBufferを結合したBufferを返却する。
	 * @param {Buffer} buf1 結合対象1
	 * @param {Buffer} buf2 結合対象2
	 * @return 結合後のバッファ(1+2の結果)
	 */
	function appendBuffer(buf1, buf2) {
		var uint8array = new Uint8Array(buf1.byteLength + buf2.byteLength);
		uint8array.set(new Uint8Array(buf1), 0);
		uint8array.set(new Uint8Array(buf2), buf1.byteLength);
		return uint8array.buffer;
	}

	/**
	 * ミリ秒をHH:MM:SS.MS形式に変換する
	 * @param {long} time ミリ秒
	 * @return 変換後の文字列
	 */
	function convertMillTime2HHMMSSMS(time) {
		var retVal = time;
		try {
			var h = String(Math.floor(time / 3600000) + 100).substring(1);
			var m = String(Math.floor((time - h * 3600000) / 60000) + 100).substring(1);
			var s = String(Math.floor((time - h * 3600000 - m * 60000) / 1000) + 100).substring(1);
			var ms = String((time - h * 3600000 - m * 60000 - s * 1000));
			retVal = h + ':' + m + ':' + s + '.' + ms;
		} catch (e) {
		}
		return retVal;
	}

	/**
	 * 引数で指定されたURLへのリクエスト処理を実施する<br>
	 * 本APIを利用する場合、サーバ設定にてクロスドメイン用設定を追加する必要がある。
	 * WebAPIへのリクエスト処理<br>
	 * TODO:サーバ側でクロスドメイン用設定を追加する事
	 *
	 * @param {String} method リクエスト種別{POST, GET. PUT}
	 * @param {String} url 接続先URL
	 * @param {String} cType コンテンツタイプ FormDataを渡す場合はnullを指定すること
	 * @param {BOLB | ArrayBuffer} sendData 送信データ{json文字列 又は FormDataを想定}
	 * @param {boolean} async 同期・非同期フラグ{false | true}
	 * @param {function} success 成功時のコールバック
	 * @param {function} error 失敗時のコールバック
	 *
	 */
	function requestApi(method, url, header, sendData, async, success, error) {
		recaiusUtils.debug("call recaiusUtils.requestApi");
		//XMLHttpRequestオブジェクト生成
		try {
			var httpObj = createHttpRequest();
			httpObj.open(method, url, async);
			if (header !== null) {
				if (header["cType"]) {
					httpObj.setRequestHeader('Content-Type', header["cType"]);
				}
			}
			httpObj.onload = function (event) {
				recaiusUtils.debug("onload status=" + event.target.status);
				//レスポンス受信完了
				if (event.target.status == 200 || event.target.status == 201 || event.target.status == 204) {
					success(event);
				} else {
					error(event);
				}
			}
			httpObj.onprogress = function (event) {
				//未処理
			}
			httpObj.onerror = function (event) {
				recaiusUtils.debug("onerror status=" + event.target.status);
				//エラー発生
				error(event);
			}
			httpObj.ontimeout = function (event) {
				//タイムアウト発生
				recaiusUtils.debug("ontimeout status=" + event.target.status);
				error(event);
			}
			/*
			if(sendData instanceof Blob){
				recaiusUtils.debug("blob[size][type]=[" + sendData.size + "][" + sendData.type + "]");
			}else if (sendData instanceof ArrayBuffer){
				recaiusUtils.debug("arrayBuffer[byteLength]=[" + sendData.byteLength + "]");
			}
			*/
			httpObj.send(sendData);
		} catch (e) {
			// e.code=19:ネットワーク障害他
			error(e);
		}
	}
	// 公開関数
	return {
		requestApi: requestApi,
		createBoundary: createBoundary,
		unicode2buffer: unicode2buffer,
		appendBuffer: appendBuffer,
		merge: merge,
		isEmpty: isEmpty,
		convertMillTime2HHMMSSMS: convertMillTime2HHMMSSMS,
		debug: function () {
			if (debugFlag) {
				if (typeof console === 'object' && 'log' in window.console) {
					try {
						return window.console.log.apply(window.console, arguments);
					} catch (err) {
						var args = Array.prototype.slice.apply(arguments);
						return window.console.log(args.join(' '));
					}
				}
			}
			return;
		}
	}
})();
