// subtitles.js
class NeuralSubtitles {
    constructor(player) {
        this.player = player;
        this.isEnabled = false;
        this.subtitleContainer = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.DEEPGRAM_API_KEY = "37ae804334d79e16b5c9b83dbab6e24f1dd9dfd2";
        this.audioStream = null;
        this.subtitleTimeout = null;

        this.init();
    }

    init() {
        this.createSubtitleContainer();
    }

    createSubtitleContainer() {
        const oldContainer = this.playerRoot.querySelector('.neural-subtitles');
        if (oldContainer) oldContainer.remove();
    
        this.subtitleContainer = document.createElement('div');
        this.subtitleContainer.className = 'neural-subtitles';
        Object.assign(this.subtitleContainer.style, {
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '80%',
            textAlign: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
            padding: '12px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            opacity: 0,
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'none'
        });
        
        this.playerRoot.appendChild(this.subtitleContainer);
    }

    async setupAudioCapture(useMicrophone = false) {
        try {
            if (useMicrophone) {
                this.audioStream = await navigator.mediaDevices.getUserMedia({ 
                    audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 } 
                });
            } else {
                this.audioStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                const videoTracks = this.audioStream.getVideoTracks();
                videoTracks.forEach(track => track.stop());
            }

            this.setupMediaRecorder();
            return true;

        } catch (error) {
            console.error('Audio capture error:', error);
            this.showAlternativeMethod();
            return false;
        }
    }

    setupMediaRecorder() {
        this.mediaRecorder = new MediaRecorder(this.audioStream, { mimeType: 'audio/webm;codecs=opus' });
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = async () => {
            if (this.audioChunks.length === 0) return;
            const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.audioChunks = [];
            const text = await this.transcribeWithAPI(blob);
            if (text) this.displaySubtitles(text);
        };
    }

    showAlternativeMethod() {
        this.subtitleContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 16px; margin-bottom: 8px; color: #ff6b6b;">⚠️ Не удалось захватить аудио</div>
                <div style="font-size: 14px; opacity: 0.8; margin-bottom: 12px;">Используйте микрофон</div>
                <button id="use-mic" style="padding: 8px 16px; background:#28a745;color:white;border:none;border-radius:6px;cursor:pointer;">Микрофон</button>
            </div>
        `;
        this.subtitleContainer.style.display = 'block';
        this.subtitleContainer.style.opacity = '1';

        document.getElementById('use-mic').addEventListener('click', async () => {
            this.subtitleContainer.style.display = 'none';
            await this.setupAudioCapture(true);
            this.enable();
        });
    }

    async toggle() {
        if (this.isEnabled) this.disable();
        else await this.enable();
    }

    async enable() {
        console.log('Enabling neural subtitles...');
        
        if (!this.mediaRecorder) {
            console.log('Setting up audio capture...');
            const success = await this.setupAudioCapture();
            if (!success) {
                console.error('Failed to setup audio capture');
                return;
            }
        }
    
        this.isEnabled = true;
        this.subtitleContainer.style.display = 'block';
        this.subtitleContainer.style.opacity = '1';
        this.isRecording = true;
        
        try {
            this.mediaRecorder.start(2000);
            console.log('Media recorder started');
    
            this.recordingInterval = setInterval(() => {
                if (this.isRecording && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                    this.mediaRecorder.start(2000);
                    console.log('Restarted media recorder');
                }
            }, 4000);
    
            this.player.showToast('Нейросубтитры включены 🎯', 2000, 'success');
        } catch (error) {
            console.error('Error starting media recorder:', error);
            this.showError('Ошибка записи аудио');
            this.disable();
        }
    }

    disable() {
        this.isEnabled = false;
        this.isRecording = false;

        if (this.mediaRecorder?.state === 'recording') this.mediaRecorder.stop();
        clearInterval(this.recordingInterval);

        this.subtitleContainer.style.opacity = '0';
        setTimeout(() => { this.subtitleContainer.style.display = 'none'; }, 300);

        this.player.showToast('Нейросубтитры выключены', 2000, 'info');
    }

    async transcribeWithAPI(blob) {
        try {
            console.log('Sending audio to Deepgram API...');
            const response = await fetch(
                "https://api.deepgram.com/v1/listen?model=nova-2&language=ru&punctuate=true",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Token ${this.DEEPGRAM_API_KEY}`,
                        "Content-Type": "audio/webm"
                    },
                    body: blob
                }
            );
            
            console.log('Deepgram response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Deepgram API error:', errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Deepgram result:', result);
            
            const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || null;
            console.log('Transcript:', transcript);
            
            return transcript;
        } catch (err) {
            console.error('Deepgram API error:', err);
            this.showError('Ошибка распознавания речи');
            return null;
        }
    }
    
    showError(message) {
        if (this.subtitleContainer) {
            this.subtitleContainer.textContent = message;
            this.subtitleContainer.style.opacity = '1';
            this.subtitleContainer.style.background = 'linear-gradient(135deg, rgba(255,0,0,0.8) 0%, rgba(200,0,0,0.6) 100%)';
            
            setTimeout(() => {
                this.subtitleContainer.style.opacity = '0';
            }, 3000);
        }
    }

    displaySubtitles(text) {
        if (!this.isEnabled || !text.trim()) return;

        text = text.replace(/\s+/g, ' ').trim();
        if (text.length > 120) text = text.substring(0, 120) + '...';

        this.subtitleContainer.textContent = text;
        this.subtitleContainer.style.opacity = '1';

        clearTimeout(this.subtitleTimeout);
        this.subtitleTimeout = setTimeout(() => { this.subtitleContainer.style.opacity = '0'; }, 5000);
    }

    destroy() {
        this.disable();
        this.audioStream?.getTracks().forEach(track => track.stop());
        this.subtitleContainer?.remove();
        clearInterval(this.recordingInterval);
    }
}

const style = document.createElement('style');
style.textContent = `
.neural-subtitles {
    font-family: 'Arial', sans-serif;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 0px 0px 10px rgba(0,0,0,0.5);
    line-height: 1.4;
}

@media (max-width: 768px) {
    .neural-subtitles { font-size: 16px !important; bottom: 70px !important; max-width: 90% !important; padding: 8px 16px !important; }
}
`;
document.head.appendChild(style);

window.NeuralSubtitles = NeuralSubtitles;
