/**
 * License (MIT)

Copyright © 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

20160218 customized by Flect Co.,LTD 
 */
(function(window){

  var WORKER_PATH = 'recorderWorker.js';

  var Recorder = function(source, cfg){
    var config = cfg || {};
    this.context = source.context;
    this.node = (this.context.createScriptProcessor ||
                 this.context.createJavaScriptNode).call(this.context,
                                                         0, 1, 1); //第2引数を0指定で環境に合ったBuffersizeを自動指定
    //WebWorkerを作成して録音を別スレッドで実行
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate,
        bufferTime: config.bufferTime
      }
    });
    var recording = false,
      successCallback,errorCallback;
    
    this.node.onaudioprocess = function(e){
      if (!recording) return;
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0)
        ]//左チャンネルのみ録音
      });
    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(sc,ec){
      recording = true;
      successCallback = sc || config.successCallback;
      errorCallback = ec || config.errorCallback;
      if (!successCallback) throw new Error('Callback not set');
    }
    
    this.stop = function(){
      recording = false;
    }

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }
    
    this.exportBlob = function(sc){
      successCallback = sc || config.successCallback;
      if (!successCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportBlob'
      });        
    }

    worker.onmessage = function(e){
      var blob = e.data;
      successCallback(blob);
    }
    
    worker.onerror = function(ev){
        if(errorCallback){
            errorCallback("E302", "recording error has occurred.\n" + ev.message);
        }else{
            console.log("recording error has occurred.\n" + ev.message);
        }
    }

    source.connect(this.node);
    this.node.connect(this.context.destination); 
  };

  window.Recorder = Recorder;

})(window);
