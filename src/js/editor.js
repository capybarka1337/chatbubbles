import '../css/editor.css';
import html2canvas from 'html2canvas';

class ChatBubbleEditor {
    constructor() {
        this.messages = [];
        this.selectedMessageId = null;
        this.isPlaying = false;
        this.animationFrameId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadFromLocalStorage();
    }

    initializeElements() {
        this.elements = {
            messagesContainer: document.getElementById('messagesContainer'),
            settingsContainer: document.getElementById('settingsContainer'),
            chatMessages: document.getElementById('chatMessages'),
            addMessageBtn: document.getElementById('addMessageBtn'),
            playBtn: document.getElementById('playBtn'),
            exportBtn: document.getElementById('exportBtn')
        };
    }

    bindEvents() {
        this.elements.addMessageBtn.addEventListener('click', () => this.addMessage());
        this.elements.playBtn.addEventListener('click', () => this.togglePlayback());
        this.elements.exportBtn.addEventListener('click', () => this.showExportModal());
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addMessage() {
        const message = {
            id: this.generateId(),
            text: 'Новое сообщение',
            sender: 'user',
            delay: 1000,
            duration: 500,
            avatar: '👤',
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };

        this.messages.push(message);
        this.renderMessagesList();
        this.selectMessage(message.id);
        this.saveToLocalStorage();
    }

    deleteMessage(id) {
        this.messages = this.messages.filter(msg => msg.id !== id);
        if (this.selectedMessageId === id) {
            this.selectedMessageId = null;
            this.renderSettings();
        }
        this.renderMessagesList();
        this.saveToLocalStorage();
    }

    selectMessage(id) {
        this.selectedMessageId = id;
        this.renderMessagesList();
        this.renderSettings();
    }

    renderMessagesList() {
        this.elements.messagesContainer.innerHTML = '';
        
        if (this.messages.length === 0) {
            this.elements.messagesContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Нет сообщений. Нажмите "Добавить сообщение" чтобы начать.</p>';
            return;
        }

        this.messages.forEach((message) => {
            const messageEl = document.createElement('div');
            messageEl.className = `message-item ${message.id === this.selectedMessageId ? 'selected' : ''}`;
            messageEl.innerHTML = `
                <div class="message-preview">${message.text}</div>
                <div class="message-meta">
                    <span>${message.sender === 'user' ? 'Отправлено' : 'Получено'} • Задержка: ${message.delay}мс</span>
                    <button class="delete-message" type="button">Удалить</button>
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
                    <input type="text" id="messageAvatar" value="${message.avatar}" maxlength="2">
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-group">
                    <label>Задержка (мс)</label>
                    <input type="number" id="messageDelay" value="${message.delay}" min="0" max="10000" step="100">
                </div>
                
                <div class="setting-group">
                    <label>Длительность анимации (мс)</label>
                    <input type="number" id="messageDuration" value="${message.duration}" min="100" max="2000" step="100">
                </div>
            </div>
            
            <div class="setting-group">
                <label>Время сообщения</label>
                <input type="text" id="messageTimestamp" value="${message.timestamp}">
            </div>
        `;

        // Bind events for settings
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
        
        // Clear chat messages
        this.elements.chatMessages.innerHTML = '';
        
        // Add typing indicator initially
        const typingIndicator = this.createTypingIndicator();
        this.elements.chatMessages.appendChild(typingIndicator);
        
        // Play messages with delays
        for (let i = 0; i < this.messages.length; i++) {
            if (!this.isPlaying) break;
            
            const message = this.messages[i];
            
            // Remove typing indicator if it's the last message or before showing a message
            if (typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            // Add typing indicator before each message (except first)
            if (i > 0 && i < this.messages.length) {
                const newTypingIndicator = this.createTypingIndicator();
                this.elements.chatMessages.appendChild(newTypingIndicator);
                await this.sleep(500); // Brief typing animation
                newTypingIndicator.remove();
            }
            
            await this.sleep(message.delay);
            
            if (!this.isPlaying) break;
            
            const messageEl = this.createMessageElement(message);
            this.elements.chatMessages.appendChild(messageEl);
            
            // Scroll to bottom
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
        
        // Remove typing indicator if it exists
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
                    <button class="export-option" data-export="gif" type="button">
                        <h3>🎬 Анимация (GIF)</h3>
                        <p>Сохранить всю анимацию как GIF файл</p>
                    </button>
                    <button class="export-option" data-export="video" type="button">
                        <h3>📹 Видео (MP4)</h3>
                        <p>Сохранить анимацию как видео файл</p>
                    </button>
                    <button class="export-option" data-export="json" type="button">
                        <h3>📄 Проект (JSON)</h3>
                        <p>Сохранить настройки проекта</p>
                    </button>
                </div>
                <button class="btn btn-secondary" id="closeExportModal" type="button">Отмена</button>
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
                    case 'gif':
                        this.exportAsGIF();
                        break;
                    case 'video':
                        this.exportAsVideo();
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
            
            // Ensure all messages are visible for screenshot
            const originalMessages = this.elements.chatMessages.innerHTML;
            
            // Render all messages without animation
            this.elements.chatMessages.innerHTML = '';
            this.messages.forEach(message => {
                const messageEl = this.createMessageElement(message);
                messageEl.style.animation = 'none';
                messageEl.style.opacity = '1';
                this.elements.chatMessages.appendChild(messageEl);
            });
            
            // Wait for rendering
            await this.sleep(100);
            
            // Capture screenshot
            const canvas = await html2canvas(this.elements.chatMessages, {
                backgroundColor: '#f8f9fa',
                scale: 2
            });
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-animation-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                
                // Restore original state
                this.elements.chatMessages.innerHTML = originalMessages;
            });
        } catch (error) {
            console.error('Ошибка при экспорте изображения:', error);
            alert('Ошибка при экспорте изображения');
            this.elements.chatMessages.innerHTML = originalMessages;
        }
    }

    async exportAsGIF() {
        alert('Экспорт в GIF требует дополнительной библиотеки (gif.js). В текущей версии эта функция недоступна, но вы можете экспортировать как изображение или видео.');
        const exportModal = document.querySelector('.export-modal');
        if (exportModal) {
            exportModal.remove();
        }
    }

    async exportAsVideo() {
        alert('Экспорт в видео требует дополнительной библиотеки (MediaRecorder API или FFmpeg.js). В текущей версии эта функция недоступна, но вы можете экспортировать как изображение.');
        const exportModal = document.querySelector('.export-modal');
        if (exportModal) {
            exportModal.remove();
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
            }
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new ChatBubbleEditor();
});