(function (Scratch) {
    'use strict';

    class eightbitAudioSynthesizer {

        //-----------------------------------------------------↓0
        constructor() {
            this.audioQueue = [];
            this.isPlaying = false;
            this.audioContext = null;
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

                    // ⭐ 新增：停止积木
                    {
                        opcode: 'stopAll',
                        blockType: 'command',
                        text: '立即停止所有声音'
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

            if (!this.audioContext || this.audioContext.state === 'closed') {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            oscillator.type = task.waveform;
            oscillator.frequency.value = task.freq;
            oscillator.connect(this.audioContext.destination);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + task.duration);

            oscillator.onended = () => {
                this.isPlaying = false;
                this.processQueue();
            };
        }
        //-----------------------------------------------------↑2.5

        //-----------------------------------------------------↓4
        // ⭐ 新增：立即停止所有声音
        stopAll() {
            this.audioQueue = [];
            this.isPlaying = false;

            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
                this.audioContext = null;
            }

            console.log("🔇 所有声音已停止");
        }
        //-----------------------------------------------------↑4
    }

    Scratch.extensions.register(new eightbitAudioSynthesizer());
})(Scratch);