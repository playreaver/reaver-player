/**
 * WWS Gateway v1.0.3 - Защитный шлюз для сайта
 * Исправлено восстановление сайта
 * @license MIT
 */

(function() {
  'use strict';
  
  console.log('🛡️ WWS Gateway v1.0.3 loading...');
  
  // НЕ сохраняем оригинальный HTML здесь - он еще не загружен!
  // Вместо этого будем хранить оригинальные скрипты и стили
  
  // Полностью очищаем body и показываем шлюз
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
  
  // Показываем загрузку
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
      <p style="color: #94a3b8; margin: 0;">Проверка безопасности...</p>
    </div>
    
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  
  class WWSGateway {
    constructor() {
      console.log('🛡️ Gateway constructor');
      
      // Ждем загрузки DOM и ВСЕГО остального
      if (document.readyState === 'complete') {
        this.init();
      } else {
        window.addEventListener('load', () => this.init());
      }
    }
    
    async init() {
      try {
        console.log('🛡️ Gateway init');
        
        // Ждем немного
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Прячем загрузку и показываем шлюз
        this.showGateway();
        
      } catch (error) {
        console.error('Gateway error:', error);
        this.allowAccess(); // В случае ошибки просто пропускаем
      }
    }
    
    showGateway() {
      console.log('🛡️ Showing gateway');
      
      // Скрываем лоадер
      const loading = document.getElementById('wws-loading');
      if (loading) loading.style.display = 'none';
      
      // Показываем шлюз
      document.body.innerHTML = this.getGatewayHTML();
      
      // Настраиваем обработчики
      this.setupGateway();
    }
    
    getGatewayHTML() {
      // Генерируем задачу
      const a = Math.floor(Math.random() * 9) + 1; // 1-9
      const b = Math.floor(Math.random() * 9) + 1; // 1-9
      const op = Math.random() > 0.5 ? '+' : '-';
      const answer = op === '+' ? a + b : a - b;
      
      // Сохраняем ответ
      window._wwsAnswer = answer;
      
      return `
        <div id="wws-gateway" style="
          max-width: 480px;
          width: 90%;
          padding: 40px 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          backdrop-filter: blur(10px);
        ">
          <!-- Заголовок -->
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
            ">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 style="
              margin: 0 0 10px;
              font-size: 28px;
              background: linear-gradient(135deg, #2563eb, #60a5fa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            ">Проверка безопасности</h1>
            <p style="color: #94a3b8; margin: 0; line-height: 1.5; font-size: 16px;">
              Подтвердите, что вы человек
            </p>
          </div>
          
          <!-- Задача -->
          <div style="
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            padding: 30px 25px;
            margin-bottom: 25px;
            border: 2px solid rgba(255, 255, 255, 0.15);
          ">
            <div style="
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
              margin-bottom: 15px;
            ">Решите простую задачу:</div>
            
            <div style="
              font-size: 42px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              margin: 25px 0;
              color: white;
              text-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
            ">${a} ${op} ${b} = ?</div>
            
            <input type="text" 
                   id="wws-answer-input"
                   placeholder="Введите ответ..."
                   style="
                     width: 100%;
                     padding: 18px 20px;
                     font-size: 20px;
                     background: rgba(255, 255, 255, 0.1);
                     border: 2px solid rgba(255, 255, 255, 0.2);
                     border-radius: 12px;
                     color: white;
                     text-align: center;
                     outline: none;
                     transition: all 0.3s;
                     font-weight: 500;
                   "
                   onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 4px rgba(37, 99, 235, 0.25)';"
                   onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.boxShadow='none';">
            
            <div id="wws-hint" style="
              font-size: 14px;
              color: #94a3b8;
              margin-top: 12px;
              min-height: 20px;
            ">Введите число от 0 до 18</div>
          </div>
          
          <!-- Кнопки -->
          <div style="display: flex; gap: 15px; margin-bottom: 25px;">
            <button id="wws-submit-btn" style="
              flex: 1;
              padding: 18px;
              font-size: 16px;
              font-weight: 600;
              background: linear-gradient(135deg, #2563eb, #3b82f6);
              color: white;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s;
              text-transform: uppercase;
              letter-spacing: 1px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(37, 99, 235, 0.4)';"
            onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
              Продолжить
            </button>
            
            <button id="wws-skip-btn" style="
              flex: 1;
              padding: 18px;
              font-size: 16px;
              font-weight: 600;
              background: rgba(255, 255, 255, 0.08);
              color: #94a3b8;
              border: 1px solid rgba(255, 255, 255, 0.15);
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.color='#e2e8f0';"
            onmouseout="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.color='#94a3b8';">
              Пропустить
            </button>
          </div>
          
          <!-- Уведомление -->
          <div id="wws-notification" style="
            display: none;
            padding: 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 500;
            font-size: 15px;
          "></div>
          
          <!-- Футер -->
          <div style="
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
            font-size: 13px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span>WWS Protect • v1.0.3</span>
            <span style="
              font-family: 'Courier New', monospace;
              background: rgba(255, 255, 255, 0.05);
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
            ">ID: ${Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
          </div>
          
          <!-- Фон -->
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            pointer-events: none;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              width: 500px;
              height: 500px;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), transparent);
              opacity: 0.15;
              top: -250px;
              right: -250px;
              filter: blur(40px);
            "></div>
            <div style="
              position: absolute;
              width: 400px;
              height: 400px;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
              opacity: 0.1;
              bottom: -200px;
              left: -200px;
              filter: blur(40px);
            "></div>
          </div>
        </div>
        
        <!-- Адаптивность -->
        <style>
          @media (max-width: 600px) {
            #wws-gateway {
              padding: 30px 20px;
              width: 95%;
            }
            
            #wws-gateway > div:first-child > div:first-child {
              font-size: 36px;
            }
            
            #wws-gateway h1 {
              font-size: 24px;
            }
            
            #wws-gateway input[type="text"] {
              font-size: 18px;
              padding: 16px;
            }
            
            button {
              padding: 16px !important;
              font-size: 15px !important;
            }
          }
          
          @media (max-width: 400px) {
            #wws-gateway {
              padding: 25px 15px;
            }
            
            #wws-gateway h1 {
              font-size: 22px;
            }
            
            #wws-gateway > div:nth-child(2) > div:nth-child(2) {
              font-size: 36px;
            }
            
            .wws-gateway-actions {
              flex-direction: column;
            }
          }
          
          /* Анимации */
          @keyframes wwsFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes wwsPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          #wws-gateway {
            animation: wwsFadeIn 0.6s ease-out;
          }
          
          #wws-gateway > div:first-child > div:first-child {
            animation: wwsPulse 2s infinite;
          }
        </style>
      `;
    }
    
    setupGateway() {
      console.log('🛡️ Setting up gateway handlers');
      
      const submitBtn = document.getElementById('wws-submit-btn');
      const skipBtn = document.getElementById('wws-skip-btn');
      const answerInput = document.getElementById('wws-answer-input');
      
      // Обработчик отправки
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.handleSubmit());
      }
      
      // Обработчик пропуска
      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          const confirmSkip = confirm('Вы уверены, что хотите пропустить проверку безопасности?\n\nРекомендуется пройти проверку для доступа ко всем функциям сайта.');
          if (confirmSkip) {
            this.showNotification('⚠️ Проверка пропущена', 'warning');
            setTimeout(() => this.allowAccess(), 1000);
          }
        });
      }
      
      // Enter для отправки
      if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.handleSubmit();
          }
        });
        
        // Автофокус
        setTimeout(() => {
          answerInput.focus();
          answerInput.select();
        }, 300);
      }
      
      // Инициализируем счетчик попыток
      this.attempts = 0;
      this.maxAttempts = 3;
    }
    
    handleSubmit() {
      const answerInput = document.getElementById('wws-answer-input');
      const userAnswer = answerInput ? answerInput.value.trim() : '';
      
      // Проверка на пустой ввод
      if (!userAnswer) {
        this.showNotification('✏️ Введите ответ', 'warning');
        if (answerInput) answerInput.focus();
        return;
      }
      
      // Проверка на число
      const userNum = parseInt(userAnswer);
      if (isNaN(userNum)) {
        this.showNotification('❌ Введите число', 'error');
        if (answerInput) {
          answerInput.value = '';
          answerInput.focus();
        }
        return;
      }
      
      // Проверка ответа
      const correctAnswer = window._wwsAnswer;
      const isCorrect = userNum === correctAnswer;
      
      if (isCorrect) {
        // Успех!
        this.showNotification('✅ Отлично! Проверка пройдена', 'success');
        
        // Запоминаем успешную проверку
        localStorage.setItem('wws_last_verified', Date.now().toString());
        localStorage.setItem('wws_session_id', Date.now().toString(36));
        
        // Переход к сайту
        setTimeout(() => this.allowAccess(), 1200);
        
      } else {
        // Ошибка
        this.attempts++;
        
        if (this.attempts >= this.maxAttempts) {
          // Превышены попытки
          this.showNotification(`❌ Превышено количество попыток (${this.maxAttempts})`, 'error');
          this.disableForm();
          
          // Все равно пропускаем через 3 секунды
          setTimeout(() => {
            this.showNotification('⏳ Пропускаем через 3 секунды...', 'info');
            setTimeout(() => this.allowAccess(), 3000);
          }, 1000);
          
        } else {
          // Еще есть попытки
          const remaining = this.maxAttempts - this.attempts;
          this.showNotification(`❌ Неверно. Осталось попыток: ${remaining}`, 'error');
          
          if (answerInput) {
            answerInput.value = '';
            answerInput.focus();
            answerInput.style.borderColor = '#ef4444';
            answerInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.25)';
            
            // Сброс цвета через время
            setTimeout(() => {
              answerInput.style.borderColor = '';
              answerInput.style.boxShadow = '';
            }, 1500);
          }
        }
      }
    }
    
    showNotification(message, type) {
      const notification = document.getElementById('wws-notification');
      if (!notification) return;
      
      // Определяем цвета по типу
      let bgColor, textColor, borderColor;
      switch (type) {
        case 'success':
          bgColor = 'rgba(34, 197, 94, 0.15)';
          textColor = '#4ade80';
          borderColor = 'rgba(34, 197, 94, 0.3)';
          break;
        case 'error':
          bgColor = 'rgba(239, 68, 68, 0.15)';
          textColor = '#f87171';
          borderColor = 'rgba(239, 68, 68, 0.3)';
          break;
        case 'warning':
          bgColor = 'rgba(234, 179, 8, 0.15)';
          textColor = '#fbbf24';
          borderColor = 'rgba(234, 179, 8, 0.3)';
          break;
        case 'info':
          bgColor = 'rgba(59, 130, 246, 0.15)';
          textColor = '#60a5fa';
          borderColor = 'rgba(59, 130, 246, 0.3)';
          break;
        default:
          bgColor = 'rgba(255, 255, 255, 0.1)';
          textColor = '#e2e8f0';
          borderColor = 'rgba(255, 255, 255, 0.2)';
      }
      
      notification.textContent = message;
      notification.style.display = 'block';
      notification.style.background = bgColor;
      notification.style.color = textColor;
      notification.style.border = `1px solid ${borderColor}`;
      
      // Автоскрытие (кроме успеха - там мы переходим)
      if (type !== 'success') {
        setTimeout(() => {
          notification.style.display = 'none';
        }, 3000);
      }
    }
    
    disableForm() {
      const submitBtn = document.getElementById('wws-submit-btn');
      const skipBtn = document.getElementById('wws-skip-btn');
      const answerInput = document.getElementById('wws-answer-input');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
      }
      
      if (skipBtn) {
        skipBtn.disabled = true;
        skipBtn.style.opacity = '0.5';
        skipBtn.style.cursor = 'not-allowed';
      }
      
      if (answerInput) {
        answerInput.disabled = true;
        answerInput.style.opacity = '0.5';
      }
    }
    
    allowAccess() {
      console.log('🛡️ Allowing access to site...');
      
      // Показываем анимацию перехода
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
        transition: opacity 0.5s ease;
      `;
      
      document.body.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="
            width: 80px;
            height: 80px;
            margin: 0 auto 25px;
            position: relative;
          ">
            <div style="
              width: 80px;
              height: 80px;
              border: 4px solid rgba(37, 99, 235, 0.2);
              border-radius: 50%;
              position: absolute;
            "></div>
            <div style="
              width: 80px;
              height: 80px;
              border: 4px solid transparent;
              border-top-color: #2563eb;
              border-radius: 50%;
              position: absolute;
              animation: spin 1s linear infinite;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 32px;
              color: #2563eb;
            ">✓</div>
          </div>
          
          <h2 style="
            margin: 0 0 15px;
            color: white;
            font-size: 28px;
            font-weight: 600;
          ">Доступ разрешён</h2>
          
          <p style="
            color: #94a3b8;
            margin: 0;
            font-size: 16px;
            max-width: 300px;
            line-height: 1.5;
          ">Загружаем сайт...</p>
          
          <div style="
            margin-top: 30px;
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-left: auto;
            margin-right: auto;
          ">
            <div style="
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, #2563eb, #3b82f6);
              border-radius: 2px;
              animation: loading 1.5s ease-in-out;
            "></div>
          </div>
        </div>
        
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0); }
          }
        </style>
      `;
      
      // Ждем и ПЕРЕЗАГРУЖАЕМ страницу для показа реального сайта
      setTimeout(() => {
        console.log('🛡️ Reloading page to show actual site...');
        
        // Вариант 1: Просто перезагружаем страницу
        // localStorage.setItem('wws_verified', 'true');
        // window.location.reload();
        
        // Вариант 2: Показываем сообщение (лучше для теста)
        document.body.innerHTML = `
          <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
          ">
            <h1 style="color: #2563eb; margin-bottom: 20px;">✅ WWS Gateway успешно пройден!</h1>
            <p style="color: #64748b; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
              Защитный шлюз проверяет, что вы не робот. В реальном сайте здесь был бы ваш контент.
            </p>
            <div style="
              background: rgba(37, 99, 235, 0.1);
              border-radius: 15px;
              padding: 30px;
              margin: 30px 0;
              border: 1px solid rgba(37, 99, 235, 0.2);
              text-align: left;
            ">
              <h3 style="color: #1e40af; margin-top: 0;">Как интегрировать:</h3>
              <ol style="color: #475569; line-height: 1.8;">
                <li>Поместите этот скрипт <strong>первым</strong> в &lt;head&gt;</li>
                <li>Ваш сайт загрузится автоматически после проверки</li>
                <li>Для реального использования уберите этот блок сообщений</li>
              </ol>
            </div>
            <button onclick="location.reload()" style="
              padding: 15px 30px;
              font-size: 16px;
              background: linear-gradient(135deg, #2563eb, #3b82f6);
              color: white;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              font-weight: 600;
            ">
              Перезагрузить для теста
            </button>
          </div>
        `;
        
        // Отправляем событие
        const event = new CustomEvent('wws:gateway-passed', {
          detail: {
            timestamp: Date.now(),
            sessionId: localStorage.getItem('wws_session_id'),
            verified: true
          }
        });
        window.dispatchEvent(event);
        
        console.log('✅ Gateway completed successfully');
        
      }, 1500);
    }
  }
  
  // Запускаем когда ВСЁ загружено (включая изображения и т.д.)
  window.addEventListener('load', () => {
    console.log('🛡️ Page fully loaded, starting WWS Gateway');
    window.wwsGateway = new WWSGateway();
  });
  
  // Фолбэк на случай если load уже прошел
  if (document.readyState === 'complete') {
    console.log('🛡️ Page already loaded');
    window.wwsGateway = new WWSGateway();
  }
  
})();
