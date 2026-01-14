/**
 * WWS Gateway v1.0.2 - Защитный шлюз для сайта
 * Упрощенная и исправленная версия
 * @license MIT
 */

(function() {
  'use strict';
  
  console.log('🛡️ WWS Gateway loading...');
  
  // Сохраняем оригинальный HTML чтобы восстановить позже
  const originalBodyHTML = document.body.innerHTML;
  const originalTitle = document.title;
  
  // Полностью очищаем страницу
  document.body.innerHTML = '';
  document.body.style.cssText = `
    margin: 0;
    padding: 0;
    background: #0f172a;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Показываем загрузку сразу
  document.body.innerHTML = `
    <div id="wws-loading" style="
      text-align: center;
      padding: 40px;
      max-width: 500px;
      width: 90%;
    ">
      <div style="
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: #2563eb;
        border-radius: 50%;
        margin: 0 auto 20px;
        animation: spin 1s linear infinite;
      "></div>
      <h2 style="margin: 0 0 10px; color: #2563eb;">WWS Protect</h2>
      <p style="color: #94a3b8; margin: 0;">Загрузка системы защиты...</p>
    </div>
    
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  // Основной класс
  class WWSGateway {
    constructor() {
      console.log('🛡️ WWS Gateway constructor');
      this.init();
    }
    
    async init() {
      try {
        // Ждем немного чтобы все загрузилось
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Всегда показываем шлюз для теста
        await this.showGateway();
        
      } catch (error) {
        console.error('Gateway error:', error);
        this.restoreSite();
      }
    }
    
    async showGateway() {
      console.log('🛡️ Showing gateway...');
      
      // Прячем загрузку
      document.getElementById('wws-loading').style.display = 'none';
      
      // Показываем шлюз
      document.body.innerHTML = this.getGatewayHTML();
      
      // Настраиваем
      this.setupGateway();
    }
    
    getGatewayHTML() {
      return `
        <div id="wws-gateway" style="
          max-width: 500px;
          width: 90%;
          padding: 40px 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        ">
          <!-- Логотип -->
          <div style="margin-bottom: 30px;">
            <div style="
              width: 70px;
              height: 70px;
              background: linear-gradient(135deg, #2563eb, #3b82f6);
              border-radius: 20px;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              font-weight: bold;
              color: white;
            ">WWS</div>
            <h1 style="
              margin: 0 0 10px;
              font-size: 28px;
              background: linear-gradient(135deg, #2563eb, #60a5fa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            ">Защитный шлюз</h1>
            <p style="color: #94a3b8; margin: 0; line-height: 1.5;">
              Пожалуйста, подтвердите, что вы не робот
            </p>
          </div>
          
          <!-- Задача -->
          <div style="
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            border: 2px solid rgba(255, 255, 255, 0.2);
          ">
            <div style="
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
              margin-bottom: 15px;
            ">Решите задачу:</div>
            
            <div id="wws-challenge" style="
              font-size: 36px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              margin: 20px 0;
              color: white;
            ">3 + 5 = ?</div>
            
            <input type="text" 
                   id="wws-answer" 
                   placeholder="Введите ответ..."
                   style="
                     width: 100%;
                     padding: 16px;
                     font-size: 18px;
                     background: rgba(255, 255, 255, 0.1);
                     border: 2px solid rgba(255, 255, 255, 0.2);
                     border-radius: 10px;
                     color: white;
                     text-align: center;
                     outline: none;
                     transition: all 0.3s;
                   "
                   onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.3)';"
                   onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.boxShadow='none';">
            
            <div id="wws-hint" style="
              font-size: 14px;
              color: #94a3b8;
              margin-top: 10px;
              min-height: 20px;
            ">Введите числовой ответ</div>
          </div>
          
          <!-- Счетчик попыток -->
          <div id="wws-attempts" style="
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
          ">
            <span>Попытка: <strong style="color: white;">1</strong> из 3</span>
            <span>Время: <strong style="color: white;">05:00</strong></span>
          </div>
          
          <!-- Кнопки -->
          <div style="display: flex; gap: 15px; margin-bottom: 25px;">
            <button id="wws-submit" style="
              flex: 1;
              padding: 18px;
              font-size: 16px;
              font-weight: 600;
              background: linear-gradient(135deg, #2563eb, #3b82f6);
              color: white;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.3s;
              text-transform: uppercase;
              letter-spacing: 1px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(37, 99, 235, 0.3)';"
            onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
              Продолжить
            </button>
            
            <button id="wws-skip" style="
              flex: 1;
              padding: 18px;
              font-size: 16px;
              font-weight: 600;
              background: rgba(255, 255, 255, 0.1);
              color: #94a3b8;
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)';"
            onmouseout="this.style.background='rgba(255, 255, 255, 0.1)';">
              Пропустить
            </button>
          </div>
          
          <!-- Уведомление -->
          <div id="wws-notification" style="
            display: none;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 500;
          "></div>
          
          <!-- Футер -->
          <div style="
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
            font-size: 12px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span>WWS Protect v1.0.2</span>
            <span style="
              font-family: 'Courier New', monospace;
              background: rgba(255, 255, 255, 0.05);
              padding: 5px 10px;
              border-radius: 5px;
            ">ID: ${Date.now().toString(36)}
          </div>
          
          <!-- Фоновые элементы -->
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            pointer-events: none;
          ">
            <div style="
              position: absolute;
              width: 400px;
              height: 400px;
              border-radius: 50%;
              background: linear-gradient(135deg, #2563eb, transparent);
              opacity: 0.1;
              top: -200px;
              right: -200px;
            "></div>
            <div style="
              position: absolute;
              width: 300px;
              height: 300px;
              border-radius: 50%;
              background: linear-gradient(135deg, #3b82f6, transparent);
              opacity: 0.1;
              bottom: -150px;
              left: -150px;
            "></div>
          </div>
        </div>
        
        <!-- Стили для адаптивности -->
        <style>
          @media (max-width: 600px) {
            #wws-gateway {
              padding: 30px 20px;
            }
            
            #wws-challenge {
              font-size: 28px;
            }
            
            button {
              padding: 16px !important;
            }
          }
          
          @media (max-width: 400px) {
            #wws-gateway {
              padding: 25px 15px;
            }
            
            #wws-challenge {
              font-size: 24px;
            }
          }
        </style>
      `;
    }
    
    setupGateway() {
      console.log('🛡️ Setting up gateway...');
      
      // Генерируем случайную задачу
      this.generateChallenge();
      
      // Обработчики
      const submitBtn = document.getElementById('wws-submit');
      const skipBtn = document.getElementById('wws-skip');
      const answerInput = document.getElementById('wws-answer');
      
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.checkAnswer());
      }
      
      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          if (confirm('Вы уверены, что хотите пропустить проверку безопасности?')) {
            this.allowAccess();
          }
        });
      }
      
      if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.checkAnswer();
          }
        });
        
        // Фокус на поле ввода
        setTimeout(() => answerInput.focus(), 100);
      }
      
      // Запускаем таймер
      this.startTimer();
    }
    
    generateChallenge() {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const op = Math.random() > 0.5 ? '+' : '-';
      
      this.currentAnswer = op === '+' ? (a + b) : (a - b);
      
      const challengeElement = document.getElementById('wws-challenge');
      if (challengeElement) {
        challengeElement.textContent = `${a} ${op} ${b} = ?`;
      }
      
      this.attempts = 0;
      this.updateAttemptsCounter();
    }
    
    updateAttemptsCounter() {
      const attemptsElement = document.getElementById('wws-attempts');
      if (attemptsElement) {
        attemptsElement.innerHTML = `
          <span>Попытка: <strong style="color: white;">${this.attempts + 1}</strong> из 3</span>
          <span>Время: <strong style="color: white;" id="wws-timer">05:00</strong></span>
        `;
      }
    }
    
    startTimer() {
      this.timeLeft = 300; // 5 минут в секундах
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timerElement = document.getElementById('wws-timer');
        
        if (timerElement) {
          timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.showNotification('Время истекло!', 'error');
          this.disableForm();
        }
      }, 1000);
    }
    
    async checkAnswer() {
      const answerInput = document.getElementById('wws-answer');
      const userAnswer = answerInput ? answerInput.value.trim() : '';
      
      if (!userAnswer) {
        this.showNotification('Введите ответ', 'error');
        return;
      }
      
      const userNum = parseInt(userAnswer);
      const isCorrect = !isNaN(userNum) && userNum === this.currentAnswer;
      
      if (isCorrect) {
        this.showNotification('✅ Проверка пройдена!', 'success');
        
        // Запоминаем в localStorage
        localStorage.setItem('wws_verified', Date.now().toString());
        
        // Ждем и показываем сайт
        setTimeout(() => this.allowAccess(), 1500);
      } else {
        this.attempts++;
        this.updateAttemptsCounter();
        
        if (this.attempts >= 3) {
          this.showNotification('❌ Превышено количество попыток', 'error');
          this.disableForm();
          
          // Все равно показываем сайт через 3 секунды
          setTimeout(() => this.allowAccess(), 3000);
        } else {
          this.showNotification('❌ Неправильно. Попробуйте еще раз.', 'error');
          if (answerInput) {
            answerInput.value = '';
            answerInput.focus();
          }
          
          // Новая задача после ошибки
          setTimeout(() => this.generateChallenge(), 1000);
        }
      }
    }
    
    showNotification(message, type) {
      const notification = document.getElementById('wws-notification');
      if (!notification) return;
      
      notification.textContent = message;
      notification.style.display = 'block';
      notification.style.background = type === 'success' 
        ? 'rgba(34, 197, 94, 0.2)' 
        : 'rgba(239, 68, 68, 0.2)';
      notification.style.color = type === 'success' 
        ? '#4ade80' 
        : '#f87171';
      notification.style.border = type === 'success'
        ? '1px solid rgba(34, 197, 94, 0.3)'
        : '1px solid rgba(239, 68, 68, 0.3)';
      
      // Автоскрытие
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);
    }
    
    disableForm() {
      const submitBtn = document.getElementById('wws-submit');
      const skipBtn = document.getElementById('wws-skip');
      const answerInput = document.getElementById('wws-answer');
      
      if (submitBtn) submitBtn.disabled = true;
      if (skipBtn) skipBtn.disabled = true;
      if (answerInput) answerInput.disabled = true;
      
      clearInterval(this.timerInterval);
    }
    
    allowAccess() {
      console.log('🛡️ Allowing access...');
      
      // Очищаем таймер
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      
      // Показываем анимацию перехода
      document.body.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
        ">
          <div style="text-align: center;">
            <div style="
              width: 60px;
              height: 60px;
              border: 4px solid rgba(255, 255, 255, 0.1);
              border-top-color: #2563eb;
              border-radius: 50%;
              margin: 0 auto 20px;
              animation: spin 1s linear infinite;
            "></div>
            <h3 style="color: white; margin: 0 0 10px;">Доступ разрешен</h3>
            <p style="color: #94a3b8; margin: 0;">Загружаем сайт...</p>
          </div>
        </div>
        
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;
      
      // Ждем и восстанавливаем сайт
      setTimeout(() => {
        this.restoreSite();
      }, 1000);
    }
    
    restoreSite() {
      console.log('🛡️ Restoring site...');
      
      // Восстанавливаем оригинальный контент
      document.body.innerHTML = originalBodyHTML;
      document.title = originalTitle;
      
      // Убираем стили
      document.body.style.cssText = '';
      
      // Генерируем событие что шлюз пройден
      const event = new CustomEvent('wws:gateway-passed', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(event);
      
      console.log('✅ Site restored');
    }
  }
  
  // Запускаем когда все загружено
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🛡️ DOM loaded, starting gateway');
      window.wwsGateway = new WWSGateway();
    });
  } else {
    console.log('🛡️ DOM already loaded, starting gateway');
    window.wwsGateway = new WWSGateway();
  }
  
})();
