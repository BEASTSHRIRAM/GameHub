class Checkers {
    constructor(container) {
        this.container = container;
        this.board = this.initializeBoard();
        this.currentPlayer = 'red';
        this.selectedSquare = null;
        this.gameOver = false;
        this.mustCapture = false;
        this.captureSequence = [];
        
        this.init();
    }

    init() {
        this.createBoard();
        this.updateStatus();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place red pieces (top)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'red', king: false };
                }
            }
        }
        
        // Place black pieces (bottom)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'black', king: false };
                }
            }
        }
        
        return board;
    }

    createBoard() {
        const gameBoard = document.createElement('div');
        gameBoard.className = 'checkers-game';
        
        const status = document.createElement('div');
        status.className = 'game-status';
        status.id = 'checkers-status';
        
        const boardContainer = document.createElement('div');
        boardContainer.className = 'checkers-board';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `checkers-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `checker-piece ${piece.color} ${piece.king ? 'king' : ''}`;
                    pieceElement.textContent = piece.king ? '♔' : '●';
                    square.appendChild(pieceElement);
                }
                
                boardContainer.appendChild(square);
            }
        }
        
        gameBoard.appendChild(status);
        gameBoard.appendChild(boardContainer);
        this.container.appendChild(gameBoard);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .checkers-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
            }
            
            .checkers-board {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 0;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
            }
            
            .checkers-square {
                width: 70px;
                height: 70px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .checkers-square.light {
                background: rgba(240, 217, 181, 0.9);
            }
            
            .checkers-square.dark {
                background: rgba(181, 136, 99, 0.9);
            }
            
            .checkers-square:hover {
                background: rgba(102, 126, 234, 0.3) !important;
            }
            
            .checkers-square.selected {
                background: rgba(34, 197, 94, 0.6) !important;
                box-shadow: inset 0 0 0 3px #22c55e;
            }
            
            .checkers-square.possible-move {
                background: rgba(59, 130, 246, 0.4) !important;
            }
            
            .checkers-square.possible-move::after {
                content: '';
                position: absolute;
                width: 25px;
                height: 25px;
                background: rgba(59, 130, 246, 0.8);
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.8);
            }
            
            .checker-piece {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                border: 3px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                cursor: pointer;
                user-select: none;
            }
            
            .checker-piece:hover {
                transform: scale(1.1);
            }
            
            .checker-piece.red {
                background: linear-gradient(145deg, #ef4444, #dc2626);
                color: white;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
            }
            
            .checker-piece.black {
                background: linear-gradient(145deg, #374151, #1f2937);
                color: white;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
            }
            
            .checker-piece.king {
                font-size: 2rem;
                border-color: #fbbf24;
                box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
            }
            
            .checker-piece.selected {
                transform: scale(1.15);
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
            }
            
            @media (max-width: 768px) {
                .checkers-square {
                    width: 50px;
                    height: 50px;
                }
                
                .checker-piece {
                    width: 35px;
                    height: 35px;
                    font-size: 1.2rem;
                }
                
                .checker-piece.king {
                    font-size: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    handleSquareClick(row, col) {
        if (this.gameOver) return;

        const piece = this.board[row][col];

        if (this.selectedSquare) {
            const [selectedRow, selectedCol] = this.selectedSquare;
            
            if (row === selectedRow && col === selectedCol) {
                // Deselect current square
                this.clearSelection();
            } else if (this.isValidMove(selectedRow, selectedCol, row, col)) {
                // Make the move
                const isCapture = this.makeMove(selectedRow, selectedCol, row, col);
                
                if (isCapture && this.hasMoreCaptures(row, col)) {
                    // Continue capture sequence
                    this.selectSquare(row, col);
                    this.mustCapture = true;
                } else {
                    // End turn
                    this.clearSelection();
                    this.mustCapture = false;
                    this.captureSequence = [];
                    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                    this.checkGameEnd();
                }
                this.updateStatus();
            } else if (piece && piece.color === this.currentPlayer && !this.mustCapture) {
                // Select new piece (only if not in capture sequence)
                this.selectSquare(row, col);
            } else {
                this.clearSelection();
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // Select piece
            this.selectSquare(row, col);
        }
    }

    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = [row, col];
        
        const square = this.getSquareElement(row, col);
        square.classList.add('selected');
        
        const piece = square.querySelector('.checker-piece');
        if (piece) {
            piece.classList.add('selected');
        }
        
        // Highlight possible moves
        this.highlightPossibleMoves(row, col);
    }

    clearSelection() {
        this.container.querySelectorAll('.checkers-square').forEach(square => {
            square.classList.remove('selected', 'possible-move');
        });
        this.container.querySelectorAll('.checker-piece').forEach(piece => {
            piece.classList.remove('selected');
        });
        this.selectedSquare = null;
    }

    highlightPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return;

        const moves = this.getPossibleMoves(row, col);
        moves.forEach(([toRow, toCol]) => {
            const square = this.getSquareElement(toRow, toCol);
            square.classList.add('possible-move');
        });
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = piece.king ? 
            [[-1, -1], [-1, 1], [1, -1], [1, 1]] : 
            piece.color === 'red' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (this.isValidPosition(newRow, newCol)) {
                if (!this.board[newRow][newCol]) {
                    // Simple move
                    if (!this.mustCapture) {
                        moves.push([newRow, newCol]);
                    }
                } else if (this.board[newRow][newCol].color !== piece.color) {
                    // Potential capture
                    const jumpRow = newRow + dr;
                    const jumpCol = newCol + dc;
                    
                    if (this.isValidPosition(jumpRow, jumpCol) && !this.board[jumpRow][jumpCol]) {
                        moves.push([jumpRow, jumpCol]);
                    }
                }
            }
        }

        return moves;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const moves = this.getPossibleMoves(fromRow, fromCol);
        return moves.some(([r, c]) => r === toRow && c === toCol);
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        let isCapture = false;

        // Check if it's a capture move
        const rowDiff = Math.abs(toRow - fromRow);
        if (rowDiff === 2) {
            // Capture move
            const capturedRow = fromRow + (toRow - fromRow) / 2;
            const capturedCol = fromCol + (toCol - fromCol) / 2;
            this.board[capturedRow][capturedCol] = null;
            isCapture = true;
            this.captureSequence.push([capturedRow, capturedCol]);
        }

        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Check for king promotion
        if (!piece.king) {
            if ((piece.color === 'red' && toRow === 7) || 
                (piece.color === 'black' && toRow === 0)) {
                piece.king = true;
            }
        }

        // Update display
        this.updateBoardDisplay();
        
        return isCapture;
    }

    hasMoreCaptures(row, col) {
        const piece = this.board[row][col];
        if (!piece) return false;

        const directions = piece.king ? 
            [[-1, -1], [-1, 1], [1, -1], [1, 1]] : 
            piece.color === 'red' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];

        for (const [dr, dc] of directions) {
            const enemyRow = row + dr;
            const enemyCol = col + dc;
            const jumpRow = row + dr * 2;
            const jumpCol = col + dc * 2;

            if (this.isValidPosition(enemyRow, enemyCol) && 
                this.isValidPosition(jumpRow, jumpCol) &&
                this.board[enemyRow][enemyCol] &&
                this.board[enemyRow][enemyCol].color !== piece.color &&
                !this.board[jumpRow][jumpCol]) {
                return true;
            }
        }

        return false;
    }

    updateBoardDisplay() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.getSquareElement(row, col);
                const existingPiece = square.querySelector('.checker-piece');
                
                if (existingPiece) {
                    existingPiece.remove();
                }

                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `checker-piece ${piece.color} ${piece.king ? 'king' : ''}`;
                    pieceElement.textContent = piece.king ? '♔' : '●';
                    square.appendChild(pieceElement);
                }
            }
        }
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getSquareElement(row, col) {
        return this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    checkGameEnd() {
        const redPieces = this.countPieces('red');
        const blackPieces = this.countPieces('black');
        
        if (redPieces === 0) {
            this.gameOver = true;
            this.winner = 'black';
        } else if (blackPieces === 0) {
            this.gameOver = true;
            this.winner = 'red';
        }
    }

    countPieces(color) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].color === color) {
                    count++;
                }
            }
        }
        return count;
    }

    updateStatus() {
        const status = document.getElementById('checkers-status');
        
        if (this.gameOver) {
            status.textContent = `${this.winner.charAt(0).toUpperCase() + this.winner.slice(1)} wins! 🎉`;
        } else if (this.mustCapture) {
            status.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} must continue capturing`;
        } else {
            status.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s turn`;
        }
    }

    newGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red';
        this.selectedSquare = null;
        this.gameOver = false;
        this.mustCapture = false;
        this.captureSequence = [];
        this.winner = null;
        
        this.updateBoardDisplay();
        this.clearSelection();
        this.updateStatus();
    }

    cleanup() {
        // Remove any event listeners or intervals if needed
    }
}