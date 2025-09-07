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
        
        this.init();
    }

    init() {
        this.createSubtitleContainer();
        this.setupAudioCapture();
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
        `;
        this.player.videoContainer.appendChild(this.subtitleContainer);
    }

    async setupAudioCapture() {
        try {
            this.audioStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const videoTracks = this.audioStream.getVideoTracks();
            videoTracks.forEach(track => track.stop());

            this.setupMediaRecorder();

        } catch (error) {
            console.error('Error capturing audio:', error);
            this.player.showToast('Ошибка захвата аудио', 2000, 'error');
            this.showAlternativeMethod();
        }
    }

    setupMediaRecorder() {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(this.audioStream);
        
        this.mediaRecorder = new MediaRecorder(this.audioStream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = async () => {
            if (this.isEnabled) {
                await this.processAudio();
            }
        };
    }

    async showAlternativeMethod() {
        this.subtitleContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 16px; margin-bottom: 5px;">🎤 Альтернативный режим</div>
                <div style="font-size: 12px; opacity: 0.8;">Используйте микрофон для субтитров</div>
                <button style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Включить микрофон
                </button>
            </div>
        `;
        
        this.subtitleContainer.querySelector('button').addEventListener('click', () => {
            this.setupMicrophoneCapture();
        });
    }

    async setupMicrophoneCapture() {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });
            
            this.setupMediaRecorder();
            this.subtitleContainer.innerHTML = '';
            
        } catch (error) {
            console.error('Microphone access error:', error);
            this.player.showToast('Доступ к микрофону запрещен', 2000, 'error');
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
            this.player.showToast('Аудиозахват не настроен', 2000, 'error');
            return;
        }

        try {
            this.isEnabled = true;
            this.subtitleContainer.style.display = 'block';
            
            this.mediaRecorder.start(1000);
            this.isRecording = true;
            
            this.recordingInterval = setInterval(async () => {
                if (this.isRecording) {
                    this.mediaRecorder.stop();
                    this.mediaRecorder.start(1000);
                }
            }, 5000);

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
            
            if (transcript) {
                this.displaySubtitles(transcript);
            }

        } catch (error) {
            console.error('Audio processing error:', error);
            if (error.message.includes('quota') || error.message.includes('limit')) {
                this.player.showToast('Лимит API исчерпан', 2000, 'warning');
            }
        }
    }

    async transcribeWithAPI(audioBlob) {
        try {
            const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&language=ru&punctuate=true&diarize=true", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${this.DEEPGRAM_API_KEY}`,
                    "Content-Type": "audio/webm"
                },
                body: audioBlob
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.results && result.results.channels && result.results.channels[0].alternatives[0]) {
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
`;
document.head.appendChild(style);

window.NeuralSubtitles = NeuralSubtitles;
