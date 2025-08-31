class TicTacToe {
    constructor(container) {
        this.container = container;
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.updateStatus();
    }

    createBoard() {
        const gameBoard = document.createElement('div');
        gameBoard.className = 'tictactoe-game';
        
        const status = document.createElement('div');
        status.className = 'game-status';
        status.id = 'tictactoe-status';
        
        const board = document.createElement('div');
        board.className = 'tictactoe-board';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'tictactoe-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.makeMove(i));
            board.appendChild(cell);
        }
        
        gameBoard.appendChild(status);
        gameBoard.appendChild(board);
        this.container.appendChild(gameBoard);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .tictactoe-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
            }
            
            .game-status {
                font-size: 1.2rem;
                font-weight: 600;
                text-align: center;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .tictactoe-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 16px;
                backdrop-filter: blur(10px);
            }
            
            .tictactoe-cell {
                width: 100px;
                height: 100px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                user-select: none;
            }
            
            .tictactoe-cell:hover:not(.filled) {
                background: rgba(255, 255, 255, 0.2);
                border-color: #667eea;
                transform: scale(1.05);
            }
            
            .tictactoe-cell.filled {
                cursor: not-allowed;
            }
            
            .tictactoe-cell.x {
                color: #ef4444;
            }
            
            .tictactoe-cell.o {
                color: #3b82f6;
            }
            
            .tictactoe-cell.winning {
                background: linear-gradient(45deg, #10b981, #059669);
                animation: winPulse 0.6s ease-in-out;
            }
            
            @keyframes winPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @media (max-width: 768px) {
                .tictactoe-cell {
                    width: 80px;
                    height: 80px;
                    font-size: 2rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    makeMove(index) {
        if (this.board[index] !== '' || this.gameOver) return;

        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        
        if (this.checkWinner()) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.highlightWinningCells();
        } else if (this.board.every(cell => cell !== '')) {
            this.gameOver = true;
            this.winner = 'tie';
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
        
        this.updateStatus();
    }

    updateCell(index) {
        const cell = this.container.querySelector(`[data-index="${index}"]`);
        cell.textContent = this.board[index];
        cell.classList.add('filled', this.board[index].toLowerCase());
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningPattern = pattern;
                return true;
            }
        }
        return false;
    }

    highlightWinningCells() {
        if (this.winningPattern) {
            this.winningPattern.forEach(index => {
                const cell = this.container.querySelector(`[data-index="${index}"]`);
                cell.classList.add('winning');
            });
        }
    }

    updateStatus() {
        const status = document.getElementById('tictactoe-status');
        
        if (this.gameOver) {
            if (this.winner === 'tie') {
                status.textContent = "It's a tie! 🤝";
            } else {
                status.textContent = `Player ${this.winner} wins! 🎉`;
            }
        } else {
            status.textContent = `Player ${this.currentPlayer}'s turn`;
        }
    }

    newGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.winningPattern = null;
        
        // Reset all cells
        this.container.querySelectorAll('.tictactoe-cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'tictactoe-cell';
        });
        
        this.updateStatus();
    }

    cleanup() {
        // Remove any event listeners or intervals if needed
    }
}