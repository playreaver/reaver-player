/**
 * Модуль кастомной капчи
 */

export default class WWSCaptcha {
  constructor(wws) {
    this.wws = wws;
    this.challengeContainer = null;
    this.currentChallenge = null;
  }
  
  async init(config) {
    this.config = config.modules.captcha || {};
    this.injectStyles();
    console.log('✅ Captcha module initialized');
  }
  
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .wws-captcha-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .wws-captcha-modal {
        background: white;
        border-radius: 10px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      
      .wws-captcha-title {
        margin-top: 0;
        color: #333;
        text-align: center;
      }
      
      .wws-captcha-challenge {
        font-size: 24px;
        text-align: center;
        margin: 20px 0;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 5px;
        font-family: monospace;
      }
      
      .wws-captcha-input {
        width: 100%;
        padding: 12px;
        font-size: 16px;
        border: 2px solid #ddd;
        border-radius: 5px;
        text-align: center;
      }
      
      .wws-captcha-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
      
      .wws-captcha-btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      }
      
      .wws-captcha-submit {
        background: #4CAF50;
        color: white;
      }
      
      .wws-captcha-cancel {
        background: #f44336;
        color: white;
      }
      
      .wws-captcha-timer {
        text-align: center;
        color: #666;
        margin-top: 10px;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Показать капчу
   */
  async showChallenge(context) {
    return new Promise((resolve) => {
      this.createChallengeModal(resolve);
    });
  }
  
  /**
   * Создание модального окна с капчей
   */
  createChallengeModal(resolve) {
    // Создаем оверлей
    this.challengeContainer = document.createElement('div');
    this.challengeContainer.className = 'wws-captcha-overlay';
    
    // Генерируем задачу
    const challenge = this.generateChallenge();
    this.currentChallenge = challenge;
    
    // Таймер (30 секунд)
    let timeLeft = 30;
    const timerElement = document.createElement('div');
    timerElement.className = 'wws-captcha-timer';
    
    const updateTimer = () => {
      timerElement.textContent = `Осталось времени: ${timeLeft}с`;
      timeLeft--;
      
      if (timeLeft < 0) {
        clearInterval(timer);
        this.removeChallenge();
        resolve(false); // Время вышло
      }
    };
    
    const timer = setInterval(updateTimer, 1000);
    updateTimer();
    
    // Создаем модальное окно
    this.challengeContainer.innerHTML = `
      <div class="wws-captcha-modal">
        <h3 class="wws-captcha-title">Подтвердите, что вы человек</h3>
        <p>Решите задачу:</p>
        <div class="wws-captcha-challenge">${challenge.question}</div>
        <input type="text" 
               class="wws-captcha-input" 
               placeholder="Введите ответ"
               autocomplete="off"
               autocorrect="off"
               autocapitalize="off"
               spellcheck="false">
        <div class="wws-captcha-buttons">
          <button class="wws-captcha-btn wws-captcha-submit">Проверить</button>
          <button class="wws-captcha-btn wws-captcha-cancel">Отмена</button>
        </div>
      </div>
    `;
    
    // Добавляем таймер
    this.challengeContainer.querySelector('.wws-captcha-modal')
      .appendChild(timerElement);
    
    // Обработчики событий
    const input = this.challengeContainer.querySelector('.wws-captcha-input');
    const submitBtn = this.challengeContainer.querySelector('.wws-captcha-submit');
    const cancelBtn = this.challengeContainer.querySelector('.wws-captcha-cancel');
    
    input.focus();
    
    submitBtn.addEventListener('click', () => {
      const answer = input.value.trim();
      if (this.verifyAnswer(answer, challenge)) {
        clearInterval(timer);
        this.removeChallenge();
        resolve(true); // Успешная проверка
      } else {
        input.value = '';
        input.placeholder = 'Неверно, попробуйте снова';
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 500);
      }
    });
    
    cancelBtn.addEventListener('click', () => {
      clearInterval(timer);
      this.removeChallenge();
      resolve(false); // Отмена
    });
    
    // Enter для отправки
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });
    
    // Добавляем на страницу
    document.body.appendChild(this.challengeContainer);
  }
  
  /**
   * Генерация задачи
   */
  generateChallenge() {
    const types = this.config.type || 'math';
    
    switch (types) {
      case 'math':
        return this.generateMathChallenge();
      case 'text':
        return this.generateTextChallenge();
      case 'puzzle':
        return this.generatePuzzleChallenge();
      default:
        return this.generateMathChallenge();
    }
  }
  
  /**
   * Математическая задача
   */
  generateMathChallenge() {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let a, b;
    switch (this.config.difficulty) {
      case 'easy':
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        break;
      case 'hard':
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        break;
      default: // medium
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
    }
    
    let question, answer;
    switch (op) {
      case '+':
        question = `${a} + ${b} = ?`;
        answer = a + b;
        break;
      case '-':
        question = `${a} - ${b} = ?`;
        answer = a - b;
        break;
      case '*':
        question = `${a} × ${b} = ?`;
        answer = a * b;
        break;
    }
    
    return { question, answer: answer.toString() };
  }
  
  /**
   * Текстовая задача
   */
  generateTextChallenge() {
    const questions = [
      { q: "Какой цвет у неба в ясный день?", a: ["синий", "голубой"] },
      { q: "Сколько лап у кошки?", a: ["4", "четыре"] },
      { q: "Первая буква алфавита?", a: ["а", "a"] },
      { q: "Столица России?", a: ["москва"] }
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    return {
      question: question.q,
      answer: question.a
    };
  }
  
  /**
   * Проверка ответа
   */
  verifyAnswer(userAnswer, challenge) {
    if (Array.isArray(challenge.answer)) {
      return challenge.answer.some(ans => 
        ans.toLowerCase() === userAnswer.toLowerCase()
      );
    }
    return challenge.answer.toLowerCase() === userAnswer.toLowerCase();
  }
  
  /**
   * Удаление капчи
   */
  removeChallenge() {
    if (this.challengeContainer && this.challengeContainer.parentNode) {
      this.challengeContainer.parentNode.removeChild(this.challengeContainer);
      this.challengeContainer = null;
    }
  }
  
  destroy() {
    this.removeChallenge();
  }
}
