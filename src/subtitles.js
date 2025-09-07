// subtitles.js
class NeuralSubtitles {
    constructor(player) {
        this.player = player;
        this.isEnabled = false;
        this.subtitleContainer = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingInterval = null;
        this.isRecording = false;
        this.DEEPGRAM_API_KEY = "37ae804334d79e16b5c9b83dbab6e24f1dd9dfd2";
        this.currentText = '';
        this.subtitleTimeout = null;
        this.audioStream = null;
        
        this.init();
    }

    init() {
        this.createSubtitleContainer();
    }

    createSubtitleContainer() {
        const oldContainer = this.player.videoContainer.querySelector('.neural-subtitles');
        if (oldContainer) oldContainer.remove();

        this.subtitleContainer = document.createElement('div');
        this.subtitleContainer.className = 'neural-subtitles';
        this.subtitleContainer.style.cssText = `
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            max-width: 80%;
            text-align: center;
            color: white;
            font-size: 20px;
            font-weight: 600;
            background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%);
            padding: 12px 20px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            z-index: 1000;
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
            border: 1px solid rgba(255,255,255,0.2);
            display: none;
        `;
        this.player.videoContainer.appendChild(this.subtitleContainer);
    }

    async setupAudioCapture() {
        try {

            this.audioStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const audioTracks = this.audioStream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('Аудио не было разрешено при захвате экрана');
            }

            const videoTracks = this.audioStream.getVideoTracks();
            videoTracks.forEach(track => track.stop());

            this.setupMediaRecorder();
            return true;

        } catch (error) {
            console.error('Error capturing audio:', error);
            this.player.showToast('Ошибка захвата аудио с экрана', 2000, 'error');

            setTimeout(() => {
                this.showAlternativeMethod();
            }, 1000);
            
            return false;
        }
    }

    setupMediaRecorder() {
        try {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(this.audioStream);
            
            this.mediaRecorder = new MediaRecorder(this.audioStream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            });

            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                if (this.isEnabled && this.audioChunks.length > 0) {
                    await this.processAudio();
                }
            };

        } catch (error) {
            console.error('Error setting up media recorder:', error);
            this.player.showToast('Ошибка настройки записи аудио', 2000, 'error');
        }
    }

    showAlternativeMethod() {
        this.subtitleContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 16px; margin-bottom: 8px; color: #ff6b6b;">⚠️ Не удалось захватить аудио с видео</div>
                <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.8;">Разрешите аудио при захвате экрана или используйте микрофон</div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="retry-capture" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Повторить
                    </button>
                    <button id="use-microphone" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Использовать микрофон
                    </button>
                </div>
            </div>
        `;
        
        this.subtitleContainer.style.display = 'block';
        this.subtitleContainer.style.opacity = '1';

        document.getElementById('retry-capture').addEventListener('click', () => {
            this.setupAudioCapture();
        });

        document.getElementById('use-microphone').addEventListener('click', () => {
            this.setupMicrophoneCapture();
        });
    }

    async setupMicrophoneCapture() {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                    channelCount: 1
                }
            });
            
            this.setupMediaRecorder();
            this.subtitleContainer.innerHTML = '';
            this.subtitleContainer.style.display = 'none';
            
            this.player.showToast('Используется микрофон для субтитров 🎤', 2000, 'info');
            
        } catch (error) {
            console.error('Microphone access error:', error);
            this.player.showToast('Доступ к микрофону запрещен', 2000, 'error');
            
            this.subtitleContainer.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 16px; margin-bottom: 8px; color: #ff6b6b;">🚫 Доступ запрещен</div>
                    <div style="font-size: 14px; opacity: 0.8;">Разрешите доступ к микрофону в настройках браузера</div>
                </div>
            `;
        }
    }

    async toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            await this.enable();
        }
    }

    async enable() {
        if (!this.mediaRecorder) {
            const success = await this.setupAudioCapture();
            if (!success) return;
        }

        try {
            this.isEnabled = true;
            this.subtitleContainer.style.display = 'block';
            this.subtitleContainer.style.opacity = '1';
            
            this.mediaRecorder.start(1000);
            this.isRecording = true;
            
            this.recordingInterval = setInterval(async () => {
                if (this.isRecording && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                    this.mediaRecorder.start(1000);
                }
            }, 4000);

            this.player.showToast('Нейросубтитры включены 🎯', 2000, 'success');

        } catch (error) {
            console.error('Error starting recording:', error);
            this.player.showToast('Ошибка запуска записи', 2000, 'error');
            this.isEnabled = false;
        }
    }

    disable() {
        this.isEnabled = false;
        this.isRecording = false;
        
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
        }
        
        this.subtitleContainer.style.opacity = '0';
        setTimeout(() => {
            this.subtitleContainer.style.display = 'none';
        }, 300);

        this.player.showToast('Нейросубтитры выключены', 2000, 'info');
    }

    async processAudio() {
        if (this.audioChunks.length === 0) return;

        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.audioChunks = [];

            const transcript = await this.transcribeWithAPI(audioBlob);
            
            if (transcript && transcript.trim()) {
                this.displaySubtitles(transcript);
            }

        } catch (error) {
            console.error('Audio processing error:', error);
            if (error.message.includes('quota') || error.message.includes('limit')) {
                this.player.showToast('Лимит API исчерпан', 2000, 'warning');
            } else if (error.message.includes('Network')) {
                this.player.showToast('Ошибка сети', 2000, 'error');
            }
        }
    }

    async transcribeWithAPI(audioBlob) {
        try {
            const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&language=ru&punctuate=true", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${this.DEEPGRAM_API_KEY}`,
                    "Content-Type": "audio/webm"
                },
                body: audioBlob,
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Deepgram API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            
            if (result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
                return result.results.channels[0].alternatives[0].transcript;
            }
            
            return null;

        } catch (error) {
            console.error('Deepgram API error:', error);
            throw error;
        }
    }

    displaySubtitles(text) {
        if (!this.isEnabled || !text.trim()) return;

        text = text.replace(/\s+/g, ' ').trim();

        if (text.length > 120) {
            text = text.substring(0, 120) + '...';
        }

        this.subtitleContainer.textContent = text;
        this.subtitleContainer.style.opacity = '1';

        clearTimeout(this.subtitleTimeout);
        this.subtitleTimeout = setTimeout(() => {
            this.subtitleContainer.style.opacity = '0';
        }, 5000);
    }

    destroy() {
        this.disable();
        
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.subtitleContainer) {
            this.subtitleContainer.remove();
        }
        
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
        }
    }
}

const style = document.createElement('style');
style.textContent = `
.neural-subtitles {
    font-family: 'Arial', sans-serif;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 
                 0px 0px 10px rgba(0,0,0,0.5),
                 0px 0px 20px rgba(0,0,0,0.3);
    line-height: 1.4;
}

.neural-subtitles::before {
    content: '🤖 ';
    opacity: 0.7;
    margin-right: 5px;
}

@media (max-width: 768px) {
    .neural-subtitles {
        font-size: 16px !important;
        bottom: 70px !important;
        max-width: 90% !important;
        padding: 8px 16px !important;
    }
}

.neural-subtitles button {
    transition: all 0.2s ease;
}

.neural-subtitles button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
`;
document.head.appendChild(style);

window.NeuralSubtitles = NeuralSubtitles;
