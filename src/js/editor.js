import '../css/editor.css';
import html2canvas from 'html2canvas';

class ChatBubbleEditor {
    constructor() {
        this.messages = [];
        this.selectedMessageId = null;
        this.isPlaying = false;
        this.animationFrameId = null;
        
        this.templates = [
            {
                id: 'greeting',
                name: 'Приветствие',
                icon: '👋',
                description: 'Простое приветствие',
                messages: [
                    { text: 'Привет! 👋', sender: 'other', delay: 0, duration: 500, avatar: '👤' },
                    { text: 'Как дела?', sender: 'other', delay: 800, duration: 500, avatar: '👤' }
                ]
            },
            {
                id: 'conversation',
                name: 'Диалог',
                icon: '💬',
                description: 'Живой диалог',
                messages: [
                    { text: 'Привет! 🙌', sender: 'other', delay: 0, duration: 500, avatar: '👤' },
                    { text: 'Привет! 😊', sender: 'user', delay: 1200, duration: 500, avatar: '🧑' },
                    { text: 'Как прошел твой день?', sender: 'other', delay: 1800, duration: 500, avatar: '👤' },
                    { text: 'Отлично! 🎉', sender: 'user', delay: 2800, duration: 500, avatar: '🧑' }
                ]
            },
            {
                id: 'news',
                name: 'Новость',
                icon: '📰',
                description: 'Объявление новости',
                messages: [
                    { text: 'Есть срочное сообщение! 🚨', sender: 'other', delay: 0, duration: 600, avatar: '📢' },
                    { text: 'Слушаю внимательно', sender: 'user', delay: 1200, duration: 500, avatar: '🧑' },
                    { text: 'Проект успешно завершен! 🎊', sender: 'other', delay: 1900, duration: 600, avatar: '📢' }
                ]
            },
            {
                id: 'question',
                name: 'Вопрос-ответ',
                icon: '❓',
                description: 'Q&A диалог',
                messages: [
                    { text: 'У тебя есть минута? ⏰', sender: 'other', delay: 0, duration: 500, avatar: '👤' },
                    { text: 'Конечно, что-то случилось?', sender: 'user', delay: 1200, duration: 500, avatar: '🧑' },
                    { text: 'Когда встреча в понедельник?', sender: 'other', delay: 1800, duration: 500, avatar: '👤' },
                    { text: 'В 10:00 в офисе', sender: 'user', delay: 2800, duration: 500, avatar: '🧑' }
                ]
            },
            {
                id: 'joke',
                name: 'Анекдот',
                icon: '😂',
                description: 'Смешное объявление',
                messages: [
                    { text: 'Слышал анекдот? 😄', sender: 'other', delay: 0, duration: 500, avatar: '🤡' },
                    { text: 'Не слышал! 😊', sender: 'user', delay: 1100, duration: 500, avatar: '🧑' },
                    { text: 'Сейчас расскажу...', sender: 'other', delay: 1800, duration: 400, avatar: '🤡' },
                    { text: '...', sender: 'other', delay: 2500, duration: 400, avatar: '🤡' },
                    { text: 'Ахахаха! 😂', sender: 'user', delay: 3200, duration: 600, avatar: '🧑' }
                ]
            },
            {
                id: 'celebration',
                name: 'Празднование',
                icon: '🎉',
                description: 'Веселое торжество',
                messages: [
                    { text: 'Поздравляю! 🎊', sender: 'other', delay: 0, duration: 600, avatar: '🎈' },
                    { text: 'Спасибо! 🙏', sender: 'user', delay: 1300, duration: 500, avatar: '🧑' },
                    { text: 'Это лучший день! 🎉', sender: 'other', delay: 1900, duration: 600, avatar: '🎈' },
                    { text: 'Давай отметим! 🍾', sender: 'user', delay: 2800, duration: 500, avatar: '🧑' }
                ]
            },
            {
                id: 'important',
                name: 'Срочное',
                icon: '🔴',
                description: 'Важное уведомление',
                messages: [
                    { text: 'СРОЧНО! ⚠️', sender: 'other', delay: 0, duration: 700, avatar: '🚨' },
                    { text: 'Что случилось?', sender: 'user', delay: 1300, duration: 600, avatar: '🧑' },
                    { text: 'Нужна помощь сейчас!', sender: 'other', delay: 2000, duration: 600, avatar: '🚨' },
                    { text: 'На что мне нужно?', sender: 'user', delay: 3000, duration: 600, avatar: '🧑' }
                ]
            },
            {
                id: 'confirmation',
                name: 'Подтверждение',
                icon: '✅',
                description: 'Утверждение действия',
                messages: [
                    { text: 'Ты уверен? 🤔', sender: 'other', delay: 0, duration: 500, avatar: '👤' },
                    { text: 'Да, все готово', sender: 'user', delay: 1100, duration: 500, avatar: '🧑' },
                    { text: 'Отлично! ✨', sender: 'other', delay: 1800, duration: 600, avatar: '👤' },
                    { text: 'Запущено! ✅', sender: 'other', delay: 2600, duration: 600, avatar: '👤' }
                ]
            }
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.renderTemplates();
        this.loadFromLocalStorage();
    }

    initializeElements() {
        this.elements = {
            messagesContainer: document.getElementById('messagesContainer'),
            settingsContainer: document.getElementById('settingsContainer'),
            chatMessages: document.getElementById('chatMessages'),
            addMessageBtn: document.getElementById('addMessageBtn'),
            playBtn: document.getElementById('playBtn'),
            exportBtn: document.getElementById('exportBtn'),
            templatesContainer: document.getElementById('templatesContainer'),
            messageCount: document.getElementById('messageCount'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content')
        };
    }

    bindEvents() {
        this.elements.addMessageBtn.addEventListener('click', () => this.addMessage());
        this.elements.playBtn.addEventListener('click', () => this.togglePlayback());
        this.elements.exportBtn.addEventListener('click', () => this.showExportModal());
        
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        this.elements.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.elements.tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    renderTemplates() {
        this.elements.templatesContainer.innerHTML = '';
        
        this.templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <div class="template-icon">${template.icon}</div>
                <div class="template-name">${template.name}</div>
                <div class="template-desc">${template.description}</div>
            `;
            
            card.addEventListener('click', () => {
                this.loadTemplate(template);
            });
            
            this.elements.templatesContainer.appendChild(card);
        });
    }

    loadTemplate(template) {
        this.messages = template.messages.map(msg => ({
            id: this.generateId(),
            text: msg.text,
            sender: msg.sender,
            delay: msg.delay,
            duration: msg.duration,
            avatar: msg.avatar,
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        }));
        
        this.selectedMessageId = null;
        this.renderMessagesList();
        this.updateMessageCount();
        this.saveToLocalStorage();
        
        this.switchTab('messages');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addMessage() {
        const message = {
            id: this.generateId(),
            text: 'Новое сообщение',
            sender: 'user',
            delay: 1000 + (this.messages.length * 500),
            duration: 500,
            avatar: '👤',
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };

        this.messages.push(message);
        this.renderMessagesList();
        this.selectMessage(message.id);
        this.updateMessageCount();
        this.saveToLocalStorage();
    }

    deleteMessage(id) {
        this.messages = this.messages.filter(msg => msg.id !== id);
        if (this.selectedMessageId === id) {
            this.selectedMessageId = null;
            this.renderSettings();
        }
        this.renderMessagesList();
        this.updateMessageCount();
        this.saveToLocalStorage();
    }

    selectMessage(id) {
        this.selectedMessageId = id;
        this.renderMessagesList();
        this.renderSettings();
    }

    updateMessageCount() {
        this.elements.messageCount.textContent = `Сообщений: ${this.messages.length}`;
    }

    renderMessagesList() {
        this.elements.messagesContainer.innerHTML = '';
        
        if (this.messages.length === 0) {
            this.elements.messagesContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: 2rem; font-size: 0.9rem;">Выберите шаблон или добавьте сообщение</p>';
            return;
        }

        this.messages.forEach((message) => {
            const messageEl = document.createElement('div');
            messageEl.className = `message-item ${message.id === this.selectedMessageId ? 'selected' : ''}`;
            messageEl.innerHTML = `
                <div class="message-preview">${message.text}</div>
                <div class="message-meta">
                    <span>${message.sender === 'user' ? '📤' : '📥'} ${message.delay}мс</span>
                    <button class="delete-message" type="button">✕</button>
                </div>
            `;

            const deleteButton = messageEl.querySelector('.delete-message');
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.deleteMessage(message.id);
            });

            messageEl.addEventListener('click', () => {
                this.selectMessage(message.id);
            });

            this.elements.messagesContainer.appendChild(messageEl);
        });
    }

    renderSettings() {
        if (!this.selectedMessageId) {
            this.elements.settingsContainer.innerHTML = '<p class="no-selection">Выберите сообщение для редактирования</p>';
            return;
        }

        const message = this.messages.find(msg => msg.id === this.selectedMessageId);
        if (!message) return;

        this.elements.settingsContainer.innerHTML = `
            <div class="setting-group">
                <label>Текст сообщения</label>
                <textarea id="messageText" placeholder="Введите текст сообщения">${message.text}</textarea>
            </div>
            
            <div class="setting-row">
                <div class="setting-group">
                    <label>Отправитель</label>
                    <select id="messageSender">
                        <option value="user" ${message.sender === 'user' ? 'selected' : ''}>Отправлено</option>
                        <option value="other" ${message.sender === 'other' ? 'selected' : ''}>Получено</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label>Аватар</label>
                    <input type="text" id="messageAvatar" value="${message.avatar}" maxlength="2" placeholder="Эмодзи">
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-group">
                    <label>Задержка (мс)</label>
                    <input type="number" id="messageDelay" value="${message.delay}" min="0" max="10000" step="100">
                </div>
                
                <div class="setting-group">
                    <label>Длительность (мс)</label>
                    <input type="number" id="messageDuration" value="${message.duration}" min="100" max="2000" step="100">
                </div>
            </div>
            
            <div class="setting-group">
                <label>Время сообщения</label>
                <input type="text" id="messageTimestamp" value="${message.timestamp}">
            </div>
        `;

        document.getElementById('messageText').addEventListener('input', (e) => {
            message.text = e.target.value;
            this.renderMessagesList();
            this.saveToLocalStorage();
        });

        document.getElementById('messageSender').addEventListener('change', (e) => {
            message.sender = e.target.value;
            this.renderMessagesList();
            this.saveToLocalStorage();
        });

        document.getElementById('messageAvatar').addEventListener('input', (e) => {
            message.avatar = e.target.value;
            this.renderMessagesList();
            this.saveToLocalStorage();
        });

        document.getElementById('messageDelay').addEventListener('input', (e) => {
            message.delay = parseInt(e.target.value);
            this.renderMessagesList();
            this.saveToLocalStorage();
        });

        document.getElementById('messageDuration').addEventListener('input', (e) => {
            message.duration = parseInt(e.target.value);
            this.saveToLocalStorage();
        });

        document.getElementById('messageTimestamp').addEventListener('input', (e) => {
            message.timestamp = e.target.value;
            this.saveToLocalStorage();
        });
    }

    async togglePlayback() {
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            await this.startPlayback();
        }
    }

    async startPlayback() {
        if (this.messages.length === 0) {
            alert('Добавьте хотя бы одно сообщение для воспроизведения');
            return;
        }

        this.isPlaying = true;
        this.elements.playBtn.innerHTML = '⏸️ Пауза';
        
        this.elements.chatMessages.innerHTML = '';
        
        const typingIndicator = this.createTypingIndicator();
        this.elements.chatMessages.appendChild(typingIndicator);
        
        for (let i = 0; i < this.messages.length; i++) {
            if (!this.isPlaying) break;
            
            const message = this.messages[i];
            
            if (typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            if (i > 0 && i < this.messages.length) {
                const newTypingIndicator = this.createTypingIndicator();
                this.elements.chatMessages.appendChild(newTypingIndicator);
                await this.sleep(500);
                newTypingIndicator.remove();
            }
            
            await this.sleep(message.delay);
            
            if (!this.isPlaying) break;
            
            const messageEl = this.createMessageElement(message);
            this.elements.chatMessages.appendChild(messageEl);
            
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
        
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }
        
        this.stopPlayback();
    }

    stopPlayback() {
        this.isPlaying = false;
        this.elements.playBtn.innerHTML = '▶️ Воспроизвести';
    }

    createMessageElement(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${message.sender === 'user' ? 'sent' : 'received'}`;
        messageEl.style.animationDuration = `${message.duration}ms`;
        
        messageEl.innerHTML = `
            <div class="message-avatar">${message.avatar}</div>
            <div class="message-content">
                <div class="message-text">${message.text}</div>
                <div class="message-time">${message.timestamp}</div>
            </div>
        `;
        
        return messageEl;
    }

    createTypingIndicator() {
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-message received';
        typingEl.innerHTML = `
            <div class="message-avatar">⏳</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        return typingEl;
    }

    showExportModal() {
        const modal = document.createElement('div');
        modal.className = 'export-modal show';
        modal.innerHTML = `
            <div class="export-content">
                <h2>Экспорт анимации</h2>
                <div class="export-options">
                    <button class="export-option" data-export="image" type="button">
                        <h3>📸 Изображение (PNG)</h3>
                        <p>Сохранить текущий кадр как изображение</p>
                    </button>
                    <button class="export-option" data-export="json" type="button">
                        <h3>📄 Проект (JSON)</h3>
                        <p>Сохранить настройки проекта</p>
                    </button>
                </div>
                <button class="btn btn-secondary btn-block" id="closeExportModal" type="button">Закрыть</button>
            </div>
        `;
        document.body.appendChild(modal);

        const exportButtons = modal.querySelectorAll('.export-option');
        exportButtons.forEach(button => {
            button.addEventListener('click', () => {
                const exportType = button.getAttribute('data-export');
                switch(exportType) {
                    case 'image':
                        this.exportAsImage();
                        break;
                    case 'json':
                        this.exportAsJSON();
                        break;
                }
            });
        });

        const closeButton = modal.querySelector('#closeExportModal');
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async exportAsImage() {
        try {
            const exportModal = document.querySelector('.export-modal');
            if (exportModal) {
                exportModal.remove();
            }
            
            const originalMessages = this.elements.chatMessages.innerHTML;
            
            this.elements.chatMessages.innerHTML = '';
            this.messages.forEach(message => {
                const messageEl = this.createMessageElement(message);
                messageEl.style.animation = 'none';
                messageEl.style.opacity = '1';
                this.elements.chatMessages.appendChild(messageEl);
            });
            
            await this.sleep(100);
            
            const canvas = await html2canvas(this.elements.chatMessages, {
                backgroundColor: '#1a1a2e',
                scale: 2
            });
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-animation-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                
                this.elements.chatMessages.innerHTML = originalMessages;
            });
        } catch (error) {
            console.error('Ошибка при экспорте изображения:', error);
            alert('Ошибка при экспорте изображения');
        }
    }

    exportAsJSON() {
        try {
            const projectData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                messages: this.messages
            };
            
            const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-project-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            const exportModal = document.querySelector('.export-modal');
            if (exportModal) {
                exportModal.remove();
            }
        } catch (error) {
            console.error('Ошибка при экспорте JSON:', error);
            alert('Ошибка при экспорте проекта');
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('chatbubbles-project', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('chatbubbles-project');
            if (saved) {
                this.messages = JSON.parse(saved);
                this.renderMessagesList();
                this.updateMessageCount();
            }
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.editor = new ChatBubbleEditor();
});
