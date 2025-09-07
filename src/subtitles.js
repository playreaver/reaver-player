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
        this.audioContext = null;
        this.audioSource = null;
        this.stream = null;
        this.subtitleTimeout = null;
        
        this.init();
    }

    init() {
        this.createSubtitleContainer();
        this.addStyles();
    }

    createSubtitleContainer() {
        const oldContainer = document.querySelector('.neural-subtitles-container');
        if (oldContainer) oldContainer.remove();
        
        this.subtitleContainer = document.createElement('div');
        this.subtitleContainer.className = 'neural-subtitles-container';
        Object.assign(this.subtitleContainer.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '80%',
            textAlign: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '15px 25px',
            borderRadius: '10px',
            zIndex: 10000,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });
        
        document.body.appendChild(this.subtitleContainer);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .neural-subtitles-container {
                font-family: 'Arial', sans-serif;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
            }
            
            @media (max-width: 768px) {
                .neural-subtitles-container {
                    font-size: 18px !important;
                    bottom: 80px !important;
                    max-width: 90% !important;
                    padding: 10px 20px !important;
                }
            }
            
            .neural-subtitles-btn {
                background: linear-gradient(135deg, #6e8efb, #a777e3);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                margin: 10px;
            }
            
            .neural-subtitles-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .neural-subtitles-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }

    async setupAudioCapture() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.audioSource = this.audioContext.createMediaElementSource(this.player.video);
            
            this.streamDestination = this.audioContext.createMediaStreamDestination();
            
            this.audioSource.connect(this.audioContext.destination);
            this.audioSource.connect(this.streamDestination); 
            
            this.stream = this.streamDestination.stream;
            
            this.setupMediaRecorder();
            return true;

        } catch (error) {
            console.error('Audio capture error:', error);
            this.showError('Ошибка подключения к аудио');
            return false;
        }
    }

    setupMediaRecorder() {
        const options = { mimeType: 'audio/webm' };
        
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
            options.mimeType = 'audio/wav';
        }
        
        this.mediaRecorder = new MediaRecorder(this.stream, options);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = async () => {
            if (this.audioChunks.length === 0) return;
            
            const blob = new Blob(this.audioChunks, { 
                type: this.mediaRecorder.mimeType 
            });
            
            this.audioChunks = [];
            const text = await this.transcribeWithAPI(blob);
            
            if (text) this.displaySubtitles(text);

            if (this.isRecording) {
                this.mediaRecorder.start(1000);
            }
        };
    }

    async toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            await this.enable();
        }
    }

    async enable() {
        try {
            if (!this.mediaRecorder) {
                const success = await this.setupAudioCapture();
                if (!success) return;
            }

            this.isEnabled = true;
            this.isRecording = true;
            this.subtitleContainer.style.opacity = '1';

            this.mediaRecorder.start(1000);
            
            this.showNotification('Нейросубтитры включены 🎯', 'success');
            
        } catch (error) {
            console.error('Enable error:', error);
            this.showError('Ошибка включения нейросубтитров');
            this.disable();
        }
    }

    disable() {
        this.isEnabled = false;
        this.isRecording = false;

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }

        if (this.subtitleContainer) {
            this.subtitleContainer.style.opacity = '0';
        }
        
        this.showNotification('Нейросубтитры выключены', 'info');
    }

    async transcribeWithAPI(blob) {
        try {
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
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            return result.results?.channels?.[0]?.alternatives?.[0]?.transcript || null;
            
        } catch (err) {
            console.error('Transcription error:', err);
            this.showError('Ошибка распознавания речи');
            return null;
        }
    }

    displaySubtitles(text) {
        if (!this.isEnabled || !text.trim()) return;
        
        text = text.replace(/\s+/g, ' ').trim();
        
        if (text.length > 100) {
            text = text.substring(0, 100) + '...';
        }
        
        this.subtitleContainer.textContent = text;
        this.subtitleContainer.style.opacity = '1';
        
        clearTimeout(this.subtitleTimeout);
        this.subtitleTimeout = setTimeout(() => {
            this.subtitleContainer.style.opacity = '0';
        }, 5000);
    }

    showError(message) {
        if (this.subtitleContainer) {
            this.subtitleContainer.textContent = message;
            this.subtitleContainer.style.background = 'rgba(255, 0, 0, 0.7)';
            this.subtitleContainer.style.opacity = '1';
            
            setTimeout(() => {
                this.subtitleContainer.style.opacity = '0';
                this.subtitleContainer.style.background = 'rgba(0, 0, 0, 0.7)';
            }, 3000);
        }
    }

    showNotification(message, type = 'info') {
        console.log(`${type}: ${message}`);
    }

    destroy() {
        this.disable();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.subtitleContainer) {
            this.subtitleContainer.remove();
        }
        
        clearTimeout(this.subtitleTimeout);
    }
}

function addSubtitlesButton(player) {
    const button = document.createElement('button');
    button.className = 'neural-subtitles-btn';
    button.textContent = 'Нейросубтитры';
    button.onclick = () => neuralSubtitles.toggle();
    
    const controls = player.root.querySelector('.controls');
    if (controls) {
        controls.appendChild(button);
    }
    
    return button;
}

let neuralSubtitles = null;

document.addEventListener('DOMContentLoaded', () => {
    const checkPlayer = setInterval(() => {
        const player = document.querySelector('video') || 
                      document.querySelector('.video-player') ||
                      document.querySelector('[data-player]');
        
        if (player) {
            clearInterval(checkPlayer);
            
            neuralSubtitles = new NeuralSubtitles({
                video: player,
                root: player.parentElement
            });
            
            addSubtitlesButton(neuralSubtitles);
        }
    }, 1000);
});

window.NeuralSubtitles = NeuralSubtitles;
