(function (Scratch) {
    'use strict';

    class eightbitAudioSynthesizer {

        //-----------------------------------------------------↓0
        constructor() {
            this.audioQueue = [];
            this.isPlaying = false;
            this.audioContext = null;
            this.volume = 0.1;
        }
        //-----------------------------------------------------↑0

        //-----------------------------------------------------↓1
        getInfo() {
            return {
                id: 'eightBitAudioSynthesizer',
                color1: '#779fae',
                name: '8bit音频合成器',
                blocks: [

                    {
                        opcode: 'playAudio',
                        blockType: 'command',
                        text: '以[音高]Hz播放8bit[波形]音符[时间]拍',
                        arguments: {
                            音高: {
                                type: 'number',
                                defaultValue: 440
                            },
                            波形: {
                                type: 'string',
                                menu: '选择波形'
                            },
                            时间: {
                                type: 'number',
                                defaultValue: 1
                            }

                        }
                    },

                    //停止
                    {
                        opcode: 'stopAll',
                        blockType: 'command',
                        text: '立即停止所有声音'
                    },

                    {
                        opcode: 'adjustVolume',
                        blockType: 'command',
                        text: '将合成器音量设为[音量]',
                        arguments: {
                            音量: {
                                type: 'number',
                                defaultValue: 10
                            }
                        }
                    },

                    {
                        opcode: 'rest',
                        blockType: 'command',
                        text: '休止 [restTime] 拍',
                        arguments: {
                            restTime: {
                                type: 'number',
                                defaultValue: 1
                            }
                        }
                    }

                ],
                //-----------------------------------------------------↓3
                menus: {
                    选择波形: {
                        items: ['square', 'sine', 'sawtooth', 'triangle']
                    }
                }
                //-----------------------------------------------------↑3
            };

        }
        //-----------------------------------------------------↑1

        //-----------------------------------------------------↓2
        playAudio(args) {
            const freq = Number(args.音高);
            const duration = Number(args.时间);
            const waveform = args.波形 || 'square';

            if (isNaN(freq) || freq < 20 || isNaN(duration) || duration <= 0) {
                return;
            }

            this.audioQueue.push({ freq, duration, waveform });
            this.processQueue();
        }
        //-----------------------------------------------------↑2

        //-----------------------------------------------------↓2.5
        processQueue() {
            if (this.isPlaying || this.audioQueue.length === 0) {
                return;
            }

            const task = this.audioQueue.shift();
            this.isPlaying = true;

            // 处理休止符
            if (task.type === 'rest') {
                setTimeout(() => {
                    this.isPlaying = false;
                    this.processQueue();
                }, task.duration * 1000);
                return;
            }

            if (!this.audioContext || this.audioContext.state === 'closed') {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            oscillator.type = task.waveform;
            oscillator.frequency.value = task.freq;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = this.volume;

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + task.duration);

            oscillator.onended = () => {
                this.isPlaying = false;
                this.processQueue();
            };
        }
        //-----------------------------------------------------↑2.5

        //-----------------------------------------------------↓4

        stopAll() {
            this.audioQueue = [];
            this.isPlaying = false;

            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
                this.audioContext = null;
            }

            console.log("停止");
        }
        //-----------------------------------------------------↑4

        //-----------------------------------------------------↓5
        adjustVolume(args) {
            const vol = Number(args.音量);

            
            if (!isNaN(vol) && vol >= 0 && vol <= 20) {
                this.volume = vol / 100;
                
            } else {
                console.warn("填 0~20 的数字");
            }
        }
        //-----------------------------------------------------↑5

        //-----------------------------------------------------↓6
        rest(args) {
            const duration = Number(args.restTime);
            if (isNaN(duration) || duration <= 0) {
                console.warn("休止时间无效，请填大于 0 的数字");
                return;
            }

            this.audioQueue.push({ type: 'rest', duration });
            this.processQueue();
        }
        //-----------------------------------------------------↑6
    }

    Scratch.extensions.register(new eightbitAudioSynthesizer());
})(Scratch);
