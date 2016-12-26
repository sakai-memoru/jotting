/**
 * License (MIT)

Copyright © 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

20160218 customized by Flect Co.,LTD 
 */

var recByteSize = 0, //録音したPCMデータのバイト数(16bit/16KHzのPCMデータサイズ)
  pcmDataArray = [], //リニアPCMデータを16khzにダウンサンプリングしたデータ配列(Int16Array)
  sendBufferByteSize, //送信バッファサイズ(Byte)
  maxBufferringByteSize, //最大バッファリングサイズ(Byte)
  SAMPLE_BIT = 16, //出力データの1サンプルあたりの量子化ビット数 16bit
  DOWN_SAMPLE_RATE = 16000, //ダウンサンプリング後のサンプリングレート(Hz)
  splitMsec, //音声の分割単位(ミリ秒)
  originalSampleRate; //入力PCMデータのサンプリングレート
  
//FIR係数
var firCoe = [-7.4137037e-4,-1.1531283e-3,-2.1740662e-4, 1.2790698e-3, 1.5922000e-3,-3.4433974e-18,-2.0013065e-3,-2.0233887e-3, 4.3397098e-4, 2.9163663e-3, 2.3894008e-3,-1.1475103e-3,-4.0206192e-3,-2.6171816e-3, 2.2067504e-3, 5.2971887e-3, 2.6168107e-3,-3.6817563e-3,-6.7156054e-3,-2.2786677e-3, 5.6507799e-3, 8.2325512e-3, 1.4663481e-3,-8.2112125e-3,-9.7937101e-3, 1.0208823e-17, 1.1504166e-2, 1.1336633e-2,-2.3823846e-3,-1.5769542e-2,-1.2794431e-2, 6.1189920e-3, 2.1479134e-2, 1.4100024e-2,-1.2078595e-2,-2.9709077e-2,-1.5190611e-2, 2.2394622e-2, 4.3465990e-2, 1.6012000e-2,-4.4309316e-2,-7.4967798e-2,-1.6522431e-2, 1.2862139e-1, 2.8390915e-1, 3.5060704e-1, 2.8390915e-1, 1.2862139e-1,-1.6522431e-2,-7.4967798e-2,-4.4309316e-2, 1.6012000e-2, 4.3465990e-2, 2.2394622e-2,-1.5190611e-2,-2.9709077e-2,-1.2078595e-2, 1.4100024e-2, 2.1479134e-2, 6.1189920e-3,-1.2794431e-2,-1.5769542e-2,-2.3823846e-3, 1.1336633e-2, 1.1504166e-2, 1.0208823e-17,-9.7937101e-3,-8.2112125e-3, 1.4663481e-3, 8.2325512e-3, 5.6507799e-3,-2.2786677e-3,-6.7156054e-3,-3.6817563e-3, 2.6168107e-3, 5.2971887e-3, 2.2067504e-3,-2.6171816e-3,-4.0206192e-3,-1.1475103e-3, 2.3894008e-3, 2.9163663e-3, 4.3397098e-4,-2.0233887e-3,-2.0013065e-3,-3.4433974e-18, 1.5922000e-3, 1.2790698e-3,-2.1740662e-4,-1.1531283e-3,-7.4137037e-4];
var firCoeLength = firCoe.length;   

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'exportBlob':
      exportBlob();
      break;
    case 'clear':
      clear();
      break;
  }
};

function init(config){
   splitMsec = config.bufferTime || 512;
   sendBufferByteSize = (SAMPLE_BIT/8) * DOWN_SAMPLE_RATE * (splitMsec/1000);
   originalSampleRate = config.sampleRate;
   
   maxBufferringByteSize = config.maxBufferringByteSize || 5242880; //最大バッファリングサイズ5MB
}

function record(inputBuffer){
  //16kHzにダウンサンプリング
  var downsampleBuffer = downsampleBufferByFIR(inputBuffer[0],DOWN_SAMPLE_RATE);
  Array.prototype.push.apply(pcmDataArray,downsampleBuffer);
  recByteSize = pcmDataArray.length *2;//16bitのデータ配列なので、Byte数としてはlengthの2倍
 
  //TODO 
　//最大バッファサイを超えたらバッファを掃除？
  if(recByteSize > maxBufferringByteSize){
     clear(); 
  }
  //送信バッファサイズ分溜まっていたら送信
  if(recByteSize >= sendBufferByteSize){
      bufferSend();
  }
}

/**
 * 送信Byteサイズ分バッファの先頭から切り出して送信
 */
function bufferSend(){
    return new Promise(function(resolve, reject){
        var dataview = new DataView(new ArrayBuffer(sendBufferByteSize));
        for(var sendByteOffset=0; sendByteOffset < sendBufferByteSize; sendByteOffset+=2){ //2byte(16bit)づつ進める
            dataview.setInt16(sendByteOffset,pcmDataArray.shift(),true); //16bitリトルエンディアンで送る
        }
        exportBlob(dataview);
        resolve();
    })
}

/**
 * 音声データをBlobにしてメインスレッドに送る
 */
function exportBlob(dataview){
  if(!dataview){
      //Bufferに残ったデータを送信する場合
      dataview = new DataView(new ArrayBuffer(pcmDataArray.length * 2));
      var sendDataLength = pcmDataArray.length *2;
      for(var sendByteOffset=0; sendByteOffset < sendDataLength; sendByteOffset+=2){
            dataview.setInt16(sendByteOffset,pcmDataArray.shift(),true);
       }
  }
  this.postMessage(new Blob([dataview], { type: 'application/octet-stream' }));
}

function clear(){
  recByteSize = 0;
  pcmDataArray = [];
}

// /**
//  * 16khzにダウンサンプリングしつつfloat32(32bit)のデータをInt16(16bit)に変換
//  */
// function downsampling(buffer, inputSampleRate, outSampleRate) {
//     if (outSampleRate == inputSampleRate) {
//         return buffer;
//     }
//     if (outSampleRate > inputSampleRate) {
//         throw "must be outSampleRate is smaller than inputSampleRate";
//     }
//     var sampleRateRatio = inputSampleRate / outSampleRate;
//     var newLength = Math.round(buffer.length / sampleRateRatio);
//     var result = [];
//     var offsetResult = 0;
//     var offsetBuffer = 0;
//     while (offsetResult < newLength) {
//         var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
//         var accum = 0, count = 0;
//         for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
//             accum += buffer[i];
//             count++;
//         }
//         result.push(Math.min(1, accum / count)*0x7FFF);
//         offsetResult++;
//         offsetBuffer = nextOffsetBuffer;
//     }
//     return result;
// }

/**
 * FIRフィルタでダウンサンプリング
 */
function downsampleBufferByFIR(buffer, rate) {
  // console.log("downsampleBufferByFIR");
  if (rate == originalSampleRate) {
    return buffer;
  }
  if (rate > originalSampleRate) {
    throw "downsampling rate show be smaller than original sample rate";
  }

  // FIR
  var firLength = buffer.length - ( firCoeLength - 1);
  var firResult = new Float32Array(firLength);
  var i,k,n;
  for(i = 0; i < firLength; i++){      
    firResult[i] = 0.0;
    n = i + firCoeLength - 1;
    for ( k = 0; k < firCoeLength ; k++ ){      
      firResult[i] = firResult[i] + firCoe[k] * buffer[ n - k ];
    }
  }

  // downsample
  var sampleRateRatio = originalSampleRate / rate;
  var newLength = Math.floor( firLength / sampleRateRatio);
  var result = [];
  var offsetResult = 0;
  var offsetBuffer = 0;
  while (offsetResult < newLength) {
    var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    var s = Math.max(-1, Math.min(1, firResult[offsetBuffer]));
    result.push(s < 0 ? s * 0x8000 : s * 0x7FFF);
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  // console.log("offsetResult=" + offsetResult + ",newLength=" + newLength);
  
  return result;
}

