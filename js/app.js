// Main App Controller
class GameHub {
    constructor() {
        this.currentGame = null;
        this.username = '';
        this.userId = '';
        this.messages = [];
        this.onlineUsers = 1;
        this.friends = [];
        this.inviteLink = '';
        this.chatConversations = {
            'general': { messages: [], unread: 0 }
        };
        this.currentChat = 'general';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUsername();
        this.initChat();
        this.checkInviteLink();
    }

    setupEventListeners() {
        // Game selection
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = card.dataset.game;
                this.loadGame(gameType);
            });
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showGameSelection();
        });

        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            if (this.currentGame && this.currentGame.newGame) {
                this.currentGame.newGame();
            }
        });

        // Username input
        document.getElementById('username').addEventListener('change', (e) => {
            this.createAccount(e.target.value);
        });

        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', () => {
            this.showUserMenu();
        });

        document.getElementById('closeUserMenu').addEventListener('click', () => {
            this.hideUserMenu();
        });

        // Add friend functionality
        document.getElementById('addFriendBtn').addEventListener('click', () => {
            this.showAddFriendModal();
        });

        document.getElementById('closeAddFriend').addEventListener('click', () => {
            this.hideAddFriendModal();
        });

        document.getElementById('addByIdBtn').addEventListener('click', () => {
            this.addFriendById();
        });

        document.getElementById('addByLinkBtn').addEventListener('click', () => {
            this.addFriendByLink();
        });

        // Copy invite link
        document.getElementById('copyInviteBtn').addEventListener('click', () => {
            this.copyInviteLink();
        });

        // Chat functionality
        document.getElementById('chatToggle').addEventListener('click', () => {
            this.toggleChat();
        });

        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Chat tabs functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-tab')) {
                const chatId = e.target.dataset.chat;
                this.switchChat(chatId);
            }
            if (e.target.classList.contains('close-tab')) {
                e.stopPropagation();
                const chatId = e.target.parentElement.dataset.chat;
                this.closeChatTab(chatId);
            }
        });

        // Close modals on overlay click
        document.getElementById('userMenuModal').addEventListener('click', (e) => {
            if (e.target.id === 'userMenuModal') {
                this.hideUserMenu();
            }
        });

        document.getElementById('addFriendModal').addEventListener('click', (e) => {
            if (e.target.id === 'addFriendModal') {
                this.hideAddFriendModal();
            }
        });
    }

    loadUsername() {
        const saved = localStorage.getItem('gameHubUsername');
        const savedId = localStorage.getItem('gameHubUserId');
        const savedFriends = localStorage.getItem('gameHubFriends');
        
        if (saved && savedId) {
            this.username = saved;
            this.userId = savedId;
            document.getElementById('username').value = saved;
            this.updateProfileDisplay();
        }
        
        if (savedFriends) {
            this.friends = JSON.parse(savedFriends);
        }
        
        this.generateInviteLink();
    }

    createAccount(username) {
        if (!username || username.trim() === '') {
            username = 'Anonymous';
        }
        
        this.username = username.trim();
        
        // Generate user ID if not exists
        if (!this.userId) {
            this.userId = '#' + Math.random().toString(36).substr(2, 6).toUpperCase();
        }
        
        // Save to localStorage
        localStorage.setItem('gameHubUsername', this.username);
        localStorage.setItem('gameHubUserId', this.userId);
        
        this.updateProfileDisplay();
        this.generateInviteLink();
        
        this.addSystemMessage(`Account created! Welcome ${this.username} (${this.userId})`);
    }

    updateProfileDisplay() {
        document.getElementById('profileUsername').textContent = this.username;
        document.getElementById('profileId').textContent = `ID: ${this.userId}`;
    }

    generateInviteLink() {
        const baseUrl = window.location.origin + window.location.pathname;
        this.inviteLink = `${baseUrl}?invite=${this.userId}&name=${encodeURIComponent(this.username)}`;
        document.getElementById('inviteLink').value = this.inviteLink;
    }

    loadGame(gameType) {
        const gameArea = document.getElementById('gameArea');
        const gameSelection = document.getElementById('gameSelection');
        const gameContent = document.getElementById('gameContent');
        const gameTitle = document.getElementById('currentGameTitle');

        // Hide game selection, show game area
        gameSelection.style.display = 'none';
        gameArea.style.display = 'block';

        // Clear previous game content
        gameContent.innerHTML = '';

        // Load specific game
        switch (gameType) {
            case 'tictactoe':
                gameTitle.textContent = 'Tic Tac Toe';
                this.currentGame = new TicTacToe(gameContent);
                break;
            case 'chess':
                gameTitle.textContent = 'Chess';
                this.currentGame = new Chess(gameContent);
                break;
            case 'blocks':
                gameTitle.textContent = 'Blocks';
                this.currentGame = new Blocks(gameContent);
                break;
            case 'checkers':
                gameTitle.textContent = 'Checkers';
                this.currentGame = new Checkers(gameContent);
                break;
        }

        this.addSystemMessage(`Started playing ${gameTitle.textContent}`);
    }

    showGameSelection() {
        document.getElementById('gameSelection').style.display = 'block';
        document.getElementById('gameArea').style.display = 'none';
        
        if (this.currentGame && this.currentGame.cleanup) {
            this.currentGame.cleanup();
        }
        this.currentGame = null;
    }

    // Chat functionality
    initChat() {
        this.addSystemMessage('Welcome to GameHub! Start chatting with friends.');
        this.loadChatConversations();
        this.updateChatTabs();
    }

    loadChatConversations() {
        const saved = localStorage.getItem('gameHubChatConversations');
        if (saved) {
            this.chatConversations = JSON.parse(saved);
        }
        
        // Ensure general chat exists
        if (!this.chatConversations.general) {
            this.chatConversations.general = { messages: [], unread: 0 };
        }
    }

    saveChatConversations() {
        localStorage.setItem('gameHubChatConversations', JSON.stringify(this.chatConversations));
    }

    switchChat(chatId) {
        if (!this.chatConversations[chatId]) return;
        
        this.currentChat = chatId;
        this.chatConversations[chatId].unread = 0;
        this.updateChatTabs();
        this.loadChatMessages(chatId);
        this.updateChatTitle(chatId);
        this.saveChatConversations();
    }

    updateChatTabs() {
        const tabsContainer = document.getElementById('chatTabs');
        tabsContainer.innerHTML = '';
        
        Object.keys(this.chatConversations).forEach(chatId => {
            const tab = document.createElement('button');
            tab.className = `chat-tab ${chatId === this.currentChat ? 'active' : ''}`;
            tab.dataset.chat = chatId;
            
            if (this.chatConversations[chatId].unread > 0) {
                tab.classList.add('has-unread');
            }
            
            if (chatId === 'general') {
                tab.textContent = 'General';
            } else {
                const friend = this.friends.find(f => f.id === chatId);
                tab.innerHTML = `${friend ? friend.name : chatId} <span class="close-tab">×</span>`;
            }
            
            tabsContainer.appendChild(tab);
        });
    }

    updateChatTitle(chatId) {
        const titleElement = document.getElementById('chatTitle');
        if (chatId === 'general') {
            titleElement.textContent = '💬 General Chat';
        } else {
            const friend = this.friends.find(f => f.id === chatId);
            const friendName = friend ? friend.name : chatId;
            const status = friend && friend.online ? '🟢' : '⚫';
            titleElement.textContent = `💬 ${friendName} ${status}`;
        }
    }

    loadChatMessages(chatId) {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
        
        const conversation = this.chatConversations[chatId];
        if (!conversation || !conversation.messages) return;
        
        conversation.messages.forEach(msg => {
            if (msg.type === 'system') {
                this.addSystemMessageToContainer(msg.text, messagesContainer);
            } else {
                this.addMessageToContainer(msg.author, msg.text, msg.isOwn, messagesContainer);
            }
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    openFriendChat(friendId) {
        if (!this.chatConversations[friendId]) {
            this.chatConversations[friendId] = { messages: [], unread: 0 };
            const friend = this.friends.find(f => f.id === friendId);
            if (friend) {
                this.chatConversations[friendId].messages.push({
                    type: 'system',
                    text: `Started chatting with ${friend.name}`,
                    timestamp: Date.now()
                });
            }
        }
        
        this.switchChat(friendId);
        this.saveChatConversations();
    }

    closeChatTab(chatId) {
        if (chatId === 'general') return; // Can't close general chat
        
        delete this.chatConversations[chatId];
        
        if (this.currentChat === chatId) {
            this.currentChat = 'general';
        }
        
        this.updateChatTabs();
        this.switchChat(this.currentChat);
        this.saveChatConversations();
    }

    toggleChat() {
        const chatPanel = document.getElementById('chatPanel');
        const chatToggle = document.getElementById('chatToggle');
        
        chatPanel.classList.toggle('minimized');
        chatToggle.textContent = chatPanel.classList.contains('minimized') ? '+' : '−';
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        const username = this.username || 'Anonymous';
        this.addMessage(username, message, true);
        input.value = '';

        // Simulate receiving messages from other players or friends
        setTimeout(() => {
            this.simulateResponse(message);
        }, 1000 + Math.random() * 2000);
    }

    addMessage(author, text, isOwn = false, chatId = null) {
        const targetChat = chatId || this.currentChat;
        
        // Add to conversation data
        if (!this.chatConversations[targetChat]) {
            this.chatConversations[targetChat] = { messages: [], unread: 0 };
        }
        
        const messageData = { author, text, isOwn, timestamp: Date.now() };
        this.chatConversations[targetChat].messages.push(messageData);
        
        // Update unread count if not current chat
        if (targetChat !== this.currentChat && !isOwn) {
            this.chatConversations[targetChat].unread++;
        }
        
        // Add to UI if it's the current chat
        if (targetChat === this.currentChat) {
            const messagesContainer = document.getElementById('chatMessages');
            this.addMessageToContainer(author, text, isOwn, messagesContainer);
        }
        
        this.updateChatTabs();
        this.saveChatConversations();
    }

    addMessageToContainer(author, text, isOwn, container) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isOwn ? 'own' : 'other'}`;
        
        if (!isOwn) {
            const authorDiv = document.createElement('div');
            authorDiv.className = 'message-author';
            authorDiv.textContent = author;
            messageDiv.appendChild(authorDiv);
        }
        
        const textDiv = document.createElement('div');
        textDiv.textContent = text;
        messageDiv.appendChild(textDiv);
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    addSystemMessage(text, chatId = null) {
        const targetChat = chatId || this.currentChat;
        
        // Add to conversation data
        if (!this.chatConversations[targetChat]) {
            this.chatConversations[targetChat] = { messages: [], unread: 0 };
        }
        
        this.chatConversations[targetChat].messages.push({
            type: 'system',
            text,
            timestamp: Date.now()
        });
        
        // Add to UI if it's the current chat
        if (targetChat === this.currentChat) {
            const messagesContainer = document.getElementById('chatMessages');
            this.addSystemMessageToContainer(text, messagesContainer);
        }
        
        this.saveChatConversations();
    }

    addSystemMessageToContainer(text, container) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        messageDiv.textContent = text;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    simulateResponse(originalMessage) {
        if (this.currentChat === 'general') {
            // General chat responses
            const responses = [
                "Nice move!",
                "Want to play another round?",
                "Good game!",
                "That was fun!",
                "Your turn!",
                "Great strategy!",
                "Let's try a different game",
                "I'm ready when you are",
                "Good luck!",
                "Well played!"
            ];

            const gameResponses = {
                'gg': 'Good game to you too!',
                'good game': 'Thanks! Want to play again?',
                'your turn': 'Making my move now...',
                'ready': 'Let\'s do this!',
                'new game': 'Sure, let\'s start fresh!'
            };

            let response = gameResponses[originalMessage.toLowerCase()];
            if (!response) {
                response = responses[Math.floor(Math.random() * responses.length)];
            }

            const botNames = ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley'];
            const botName = botNames[Math.floor(Math.random() * botNames.length)];

            this.addMessage(botName, response, false);
        } else {
            // Friend chat responses
            const friend = this.friends.find(f => f.id === this.currentChat);
            if (friend && friend.online) {
                const friendResponses = [
                    "Hey! How's it going?",
                    "That's awesome!",
                    "I agree!",
                    "Haha, nice one!",
                    "Want to play a game?",
                    "I'm up for some gaming!",
                    "Let's do this!",
                    "Good point!",
                    "That sounds fun!",
                    "I'm ready when you are!"
                ];

                const personalResponses = {
                    'hi': 'Hey there!',
                    'hello': 'Hello! Good to see you!',
                    'how are you': 'I\'m doing great! How about you?',
                    'want to play': 'Absolutely! What game?',
                    'gg': 'Good game! That was fun!',
                    'thanks': 'You\'re welcome!',
                    'bye': 'See you later!'
                };

                let response = personalResponses[originalMessage.toLowerCase()];
                if (!response) {
                    response = friendResponses[Math.floor(Math.random() * friendResponses.length)];
                }

                this.addMessage(friend.name, response, false, this.currentChat);
            }
        }
    }

    updateOnlineCount(count) {
        this.onlineUsers = count;
        document.getElementById('onlineCount').textContent = `${count} online`;
    }

    // User Menu Functions
    showUserMenu() {
        document.getElementById('userMenuModal').style.display = 'flex';
        this.updateFriendsList();
    }

    hideUserMenu() {
        document.getElementById('userMenuModal').style.display = 'none';
    }

    showAddFriendModal() {
        document.getElementById('addFriendModal').style.display = 'flex';
        document.getElementById('friendIdInput').value = '';
        document.getElementById('inviteLinkInput').value = '';
    }

    hideAddFriendModal() {
        document.getElementById('addFriendModal').style.display = 'none';
    }

    // Friend Management
    addFriendById() {
        const friendId = document.getElementById('friendIdInput').value.trim();
        
        if (!friendId) {
            this.showMessage('Please enter a friend ID', 'error');
            return;
        }

        if (!friendId.startsWith('#')) {
            this.showMessage('Friend ID must start with #', 'error');
            return;
        }

        if (friendId === this.userId) {
            this.showMessage('You cannot add yourself as a friend', 'error');
            return;
        }

        if (this.friends.some(f => f.id === friendId)) {
            this.showMessage('This friend is already in your list', 'error');
            return;
        }

        // Simulate adding friend
        const friendName = this.generateFriendName();
        const friend = {
            id: friendId,
            name: friendName,
            online: Math.random() > 0.5,
            addedAt: Date.now()
        };

        this.friends.push(friend);
        this.saveFriends();
        this.updateFriendsList();
        this.hideAddFriendModal();
        
        this.showMessage(`${friendName} added as friend!`, 'success');
        this.addSystemMessage(`${friendName} (${friendId}) is now your friend!`);
        
        // Simulate friend coming online and sending a message
        setTimeout(() => {
            friend.online = true;
            this.saveFriends();
            this.updateFriendsList();
            
            // Send a welcome message in their chat
            this.addMessage(friend.name, `Hey! Thanks for adding me as a friend! 😊`, false, friend.id);
        }, 2000 + Math.random() * 3000);
    }

    addFriendByLink() {
        const inviteLink = document.getElementById('inviteLinkInput').value.trim();
        
        if (!inviteLink) {
            this.showMessage('Please paste an invite link', 'error');
            return;
        }

        try {
            const url = new URL(inviteLink);
            const friendId = url.searchParams.get('invite');
            const friendName = url.searchParams.get('name');

            if (!friendId || !friendName) {
                this.showMessage('Invalid invite link', 'error');
                return;
            }

            if (friendId === this.userId) {
                this.showMessage('You cannot add yourself as a friend', 'error');
                return;
            }

            if (this.friends.some(f => f.id === friendId)) {
                this.showMessage('This friend is already in your list', 'error');
                return;
            }

            const friend = {
                id: friendId,
                name: decodeURIComponent(friendName),
                online: Math.random() > 0.5,
                addedAt: Date.now()
            };

            this.friends.push(friend);
            this.saveFriends();
            this.updateFriendsList();
            this.hideAddFriendModal();
            
            this.showMessage(`${friend.name} added as friend!`, 'success');
            this.addSystemMessage(`${friend.name} (${friendId}) is now your friend!`);
            
            // Simulate friend coming online and sending a message
            setTimeout(() => {
                friend.online = true;
                this.saveFriends();
                this.updateFriendsList();
                
                // Send a welcome message in their chat
                this.addMessage(friend.name, `Hey! Thanks for adding me as a friend! 😊`, false, friend.id);
            }, 2000 + Math.random() * 3000);
        } catch (e) {
            this.showMessage('Invalid invite link format', 'error');
        }
    }

    removeFriend(friendId) {
        const friendIndex = this.friends.findIndex(f => f.id === friendId);
        if (friendIndex > -1) {
            const friend = this.friends[friendIndex];
            this.friends.splice(friendIndex, 1);
            this.saveFriends();
            this.updateFriendsList();
            this.addSystemMessage(`${friend.name} removed from friends`);
        }
    }

    inviteFriend(friendId) {
        const friend = this.friends.find(f => f.id === friendId);
        if (friend) {
            // Simulate sending invite
            this.addSystemMessage(`Game invite sent to ${friend.name}!`);
            
            // Simulate friend response
            setTimeout(() => {
                if (Math.random() > 0.3) {
                    this.addMessage(friend.name, `Thanks for the invite! Let's play!`, false);
                } else {
                    this.addMessage(friend.name, `I'm busy right now, maybe later?`, false);
                }
            }, 2000 + Math.random() * 3000);
        }
    }

    updateFriendsList() {
        const friendsList = document.getElementById('friendsList');
        
        if (this.friends.length === 0) {
            friendsList.innerHTML = '<div class="no-friends">No friends added yet. Add some friends to play together!</div>';
            return;
        }

        friendsList.innerHTML = this.friends.map(friend => `
            <div class="friend-item">
                <div class="friend-info">
                    <div class="friend-avatar">${friend.name.charAt(0).toUpperCase()}</div>
                    <div class="friend-details">
                        <h5>${friend.name}</h5>
                        <p class="friend-status ${friend.online ? 'online' : ''}">${friend.online ? '🟢 Online' : '⚫ Offline'}</p>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-small btn-chat" onclick="gameHub.openFriendChat('${friend.id}'); gameHub.hideUserMenu();">Chat</button>
                    <button class="btn btn-small btn-invite" onclick="gameHub.inviteFriend('${friend.id}')">Invite</button>
                    <button class="btn btn-small btn-remove" onclick="gameHub.removeFriend('${friend.id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    saveFriends() {
        localStorage.setItem('gameHubFriends', JSON.stringify(this.friends));
    }

    generateFriendName() {
        const names = ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Avery', 'Quinn', 'Blake'];
        return names[Math.floor(Math.random() * names.length)];
    }

    copyInviteLink() {
        const inviteLink = document.getElementById('inviteLink');
        inviteLink.select();
        inviteLink.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            this.showMessage('Invite link copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(inviteLink.value).then(() => {
                this.showMessage('Invite link copied to clipboard!', 'success');
            }).catch(() => {
                this.showMessage('Failed to copy link', 'error');
            });
        }
    }

    showMessage(text, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        // Insert at top of modal body
        const modalBody = document.querySelector('.modal-body');
        modalBody.insertBefore(message, modalBody.firstChild);

        // Remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }

    // Check for invite link on page load
    checkInviteLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteId = urlParams.get('invite');
        const inviteName = urlParams.get('name');

        if (inviteId && inviteName) {
            // Auto-fill the invite link input if user opens add friend modal
            setTimeout(() => {
                this.addSystemMessage(`You were invited by ${decodeURIComponent(inviteName)}! Use the user menu to add them as a friend.`);
            }, 1000);
        }
    }
}

// Initialize the app
const gameHub = new GameHub();

// Simulate online users changing
setInterval(() => {
    const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    const newCount = Math.max(1, Math.min(10, gameHub.onlineUsers + change));
    gameHub.updateOnlineCount(newCount);
}, 10000);