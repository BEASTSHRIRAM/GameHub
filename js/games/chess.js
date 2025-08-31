class Chess {
    constructor(container) {
        this.container = container;
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameOver = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.updateStatus();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Place other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: pieceOrder[i], color: 'black' };
            board[7][i] = { type: pieceOrder[i], color: 'white' };
        }
        
        return board;
    }

    createBoard() {
        const gameBoard = document.createElement('div');
        gameBoard.className = 'chess-game';
        
        const status = document.createElement('div');
        status.className = 'game-status';
        status.id = 'chess-status';
        
        const boardContainer = document.createElement('div');
        boardContainer.className = 'chess-board';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                    square.classList.add(piece.color);
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
            .chess-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
            }
            
            .chess-board {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 0;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
            }
            
            .chess-square {
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                user-select: none;
                position: relative;
            }
            
            .chess-square.light {
                background: rgba(240, 217, 181, 0.9);
                color: #333;
            }
            
            .chess-square.dark {
                background: rgba(181, 136, 99, 0.9);
                color: #333;
            }
            
            .chess-square:hover {
                background: rgba(102, 126, 234, 0.3) !important;
            }
            
            .chess-square.selected {
                background: rgba(34, 197, 94, 0.6) !important;
                box-shadow: inset 0 0 0 3px #22c55e;
            }
            
            .chess-square.possible-move {
                background: rgba(59, 130, 246, 0.4) !important;
            }
            
            .chess-square.possible-move::after {
                content: '';
                position: absolute;
                width: 20px;
                height: 20px;
                background: rgba(59, 130, 246, 0.8);
                border-radius: 50%;
            }
            
            .chess-square.white {
                color: #f8fafc;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }
            
            .chess-square.black {
                color: #1e293b;
                text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
            }
            
            @media (max-width: 768px) {
                .chess-square {
                    width: 45px;
                    height: 45px;
                    font-size: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    getPieceSymbol(piece) {
        const symbols = {
            white: {
                king: '♔', queen: '♕', rook: '♖',
                bishop: '♗', knight: '♘', pawn: '♙'
            },
            black: {
                king: '♚', queen: '♛', rook: '♜',
                bishop: '♝', knight: '♞', pawn: '♟'
            }
        };
        return symbols[piece.color][piece.type];
    }

    handleSquareClick(row, col) {
        if (this.gameOver) return;

        const square = this.getSquareElement(row, col);
        const piece = this.board[row][col];

        if (this.selectedSquare) {
            const [selectedRow, selectedCol] = this.selectedSquare;
            
            if (row === selectedRow && col === selectedCol) {
                // Deselect current square
                this.clearSelection();
            } else if (this.isValidMove(selectedRow, selectedCol, row, col)) {
                // Make the move
                this.makeMove(selectedRow, selectedCol, row, col);
                this.clearSelection();
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                this.updateStatus();
            } else if (piece && piece.color === this.currentPlayer) {
                // Select new piece
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
        
        // Highlight possible moves (simplified)
        this.highlightPossibleMoves(row, col);
    }

    clearSelection() {
        this.container.querySelectorAll('.chess-square').forEach(square => {
            square.classList.remove('selected', 'possible-move');
        });
        this.selectedSquare = null;
    }

    highlightPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return;

        // Simplified move highlighting - just show adjacent squares for demo
        for (let r = Math.max(0, row - 1); r <= Math.min(7, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
                if (r !== row || c !== col) {
                    if (this.isValidMove(row, col, r, c)) {
                        const square = this.getSquareElement(r, c);
                        square.classList.add('possible-move');
                    }
                }
            }
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        
        if (!piece) return false;
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        // Simplified validation - just check basic movement patterns
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                const startRow = piece.color === 'white' ? 6 : 1;
                
                if (colDiff === 0) {
                    if (toRow === fromRow + direction && !targetPiece) return true;
                    if (fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) return true;
                } else if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
                    return true;
                }
                return false;
                
            case 'rook':
                return (rowDiff === 0 || colDiff === 0);
                
            case 'bishop':
                return (rowDiff === colDiff);
                
            case 'queen':
                return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff);
                
            case 'king':
                return (rowDiff <= 1 && colDiff <= 1);
                
            case 'knight':
                return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2));
                
            default:
                return false;
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Update display
        const fromSquare = this.getSquareElement(fromRow, fromCol);
        const toSquare = this.getSquareElement(toRow, toCol);
        
        fromSquare.textContent = '';
        fromSquare.classList.remove('white', 'black');
        
        toSquare.textContent = this.getPieceSymbol(piece);
        toSquare.classList.remove('white', 'black');
        toSquare.classList.add(piece.color);
    }

    getSquareElement(row, col) {
        return this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    updateStatus() {
        const status = document.getElementById('chess-status');
        status.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s turn`;
    }

    newGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameOver = false;
        
        // Reset board display
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.getSquareElement(row, col);
                square.classList.remove('white', 'black', 'selected', 'possible-move');
                
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                    square.classList.add(piece.color);
                } else {
                    square.textContent = '';
                }
            }
        }
        
        this.updateStatus();
    }

    cleanup() {
        // Remove any event listeners or intervals if needed
    }
}