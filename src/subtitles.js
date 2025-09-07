// subtitles.js
class NeuralSubtitles {
    constructor(player) {
        this.player = player;
        this.isEnabled = false;
        this.currentSubtitles = [];
        this.subtitleContainer = null;
        this.recognition = null;
        this.isRecording = false;
        
        this.init();
    }

    init() {
        this.createSubtitleContainer();
        this.setupSpeechRecognition();
    }

    createSubtitleContainer() {
        this.subtitleContainer = document.createElement('div');
        this.subtitleContainer.className = 'neural-subtitles';
        this.subtitleContainer.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            text-align: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            z-index: 10;
            padding: 10px;
            transition: opacity 0.3s ease;
        `;
        this.player.videoContainer.appendChild(this.subtitleContainer);
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                this.displaySubtitles(finalTranscript || interimTranscript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.player.showToast('Ошибка распознавания речи', 2000, 'error');
            };

            this.recognition.onend = () => {
                if (this.isRecording) {
                    this.recognition.start();
                }
            };
        } else {
            console.warn('Web Speech API не поддерживается в этом браузере');
            this.player.showToast('Распознавание речи не поддерживается', 2000, 'warning');
        }
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    enable() {
        if (!this.recognition) {
            this.player.showToast('Распознавание речи недоступно', 2000, 'warning');
            return;
        }

        this.isEnabled = true;
        this.subtitleContainer.style.display = 'block';
        
        if (!this.isRecording) {
            try {
                this.recognition.start();
                this.isRecording = true;
                this.player.showToast('Нейросубтитры включены', 2000, 'success');
            } catch (error) {
                console.error('Ошибка запуска распознавания:', error);
            }
        }
    }

    disable() {
        this.isEnabled = false;
        this.subtitleContainer.style.display = 'none';
        
        if (this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            this.player.showToast('Нейросубтитры выключены', 2000, 'info');
        }
    }

    displaySubtitles(text) {
        if (!this.isEnabled) return;

        if (text.length > 100) {
            text = text.substring(0, 100) + '...';
        }

        this.subtitleContainer.textContent = text;
        
        clearTimeout(this.subtitleTimeout);
        this.subtitleTimeout = setTimeout(() => {
            this.subtitleContainer.style.opacity = '0';
        }, 5000);
        
        this.subtitleContainer.style.opacity = '1';
    }

    async transcribeWithAPI(audioBlob) {
        try {
            
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.wav');
            formData.append('language', 'ru');

            const response = await fetch('https://your-transcription-api.com/transcribe', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.text;
            }
        } catch (error) {
            console.error('Transcription API error:', error);
        }
        
        return null;
    }

    destroy() {
        this.disable();
        if (this.subtitleContainer) {
            this.subtitleContainer.remove();
        }
    }
}

window.NeuralSubtitles = NeuralSubtitles;
