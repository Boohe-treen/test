// 如果是 COMMAND：不写 return 或只写 return;
// 如果是 REPORTER：必须 return 值
// 如果是 BOOLEAN：必须 return true/false
(function (Scratch) {
    'use strict';

    class RealTimeRecording {
        // 构造函数：初始化状态
        constructor() {
            this.isListening = false;
            this.micStream = null;
            this.audioContext = null;
            this.analyser = null;
        }

        getInfo() {
            console.log("检测：扩展设置成功");

            return {
                id: 'mic',
                name: '薄荷醇的实时麦克风',
                color1: '#FF0010',

                blocks: [

                    {
                        opcode: 'getVolume',
                        blockType: 'reporter',
                        text: '实时音量'
                    },
                    {
                        opcode: 'startMic',
                        blockType: 'command',
                        text: '开始监听'
                    },
                    {
                        opcode: 'stopMic',
                        blockType: 'command',
                        text: '结束监听'
                    }
                ]
            };
        }

        // ---- 积木实现 ----

        isListening(args) {
            return this.isListening === true;
        }

        getVolume(args) {
            if (!this.analyser || !this.micStream) {
                return NaN;
            }

            try {
                const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteTimeDomainData(dataArray);

                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const value = (dataArray[i] - 128) / 128;
                    sum += value * value;
                }
                const rms = Math.sqrt(sum / dataArray.length);
                const volume = Math.min(100, Math.round(rms * 100));
                return volume;
            } catch (e) {
                return NaN;
            }
        }

        startMic(args) {
            console.log("正在请求麦克风权限...");
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    console.log("麦克风权限已获得！");
                    this.micStream = stream;

                    if (!this.audioContext || this.audioContext.state === 'closed') {
                        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    }

                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 1024;

                    const source = this.audioContext.createMediaStreamSource(stream);
                    source.connect(this.analyser);

                    this.isListening = true;  // 关键：更新状态
                    console.log("麦克风已接上解析器，可以读取音量了！(*^▽^*)");
                })
                .catch(err => {
                    console.error("获取麦克风失败：", err);
                    this.isListening = false;
                });
        }

        stopMic(args) {
            console.log("正在停止麦克风...");

            if (this.micStream) {
                this.micStream.getTracks().forEach(track => track.stop());
                this.micStream = null;
            }

            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
                this.audioContext = null;
            }

            this.analyser = null;
            this.isListening = false;  // 关键：更新状态

            console.log("麦克风已停止");
        }
    }

    // ---- 注册扩展 ----
    Scratch.extensions.register(new RealTimeRecording());
})(Scratch);