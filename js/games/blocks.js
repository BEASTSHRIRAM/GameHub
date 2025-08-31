class Blocks {
    constructor(container) {
        this.container = container;
        this.board = Array(20).fill(null).map(() => Array(10).fill(0));
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.gameLoop = null;
        this.dropTime = 0;
        this.dropCounter = 0;
        
        this.pieces = [
            // I piece
            [[[1,1,1,1]]],
            // O piece
            [[[1,1],[1,1]]],
            // T piece
            [[[0,1,0],[1,1,1]], [[1,0],[1,1],[1,0]], [[1,1,1],[0,1,0]], [[0,1],[1,1],[0,1]]],
            // S piece
            [[[0,1,1],[1,1,0]], [[1,0],[1,1],[0,1]]],
            // Z piece
            [[[1,1,0],[0,1,1]], [[0,1],[1,1],[1,0]]],
            // J piece
            [[[1,0,0],[1,1,1]], [[1,1],[1,0],[1,0]], [[1,1,1],[0,0,1]], [[0,1],[0,1],[1,1]]],
            // L piece
            [[[0,0,1],[1,1,1]], [[1,0],[1,0],[1,1]], [[1,1,1],[1,0,0]], [[1,1],[0,1],[0,1]]]
        ];
        
        this.colors = [
            '#00f5ff', // I - cyan
            '#ffff00', // O - yellow
            '#800080', // T - purple
            '#00ff00', // S - green
            '#ff0000', // Z - red
            '#0000ff', // J - blue
            '#ffa500'  // L - orange
        ];
        
        this.init();
    }

    init() {
        this.createBoard();
        this.spawnPiece();
        this.startGame();
    }

    createBoard() {
        const gameBoard = document.createElement('div');
        gameBoard.className = 'blocks-game';
        
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';
        gameInfo.innerHTML = `
            <div class="info-item">
                <span>Score</span>
                <span id="blocks-score">0</span>
            </div>
            <div class="info-item">
                <span>Level</span>
                <span id="blocks-level">1</span>
            </div>
            <div class="info-item">
                <span>Lines</span>
                <span id="blocks-lines">0</span>
            </div>
        `;
        
        const gameContainer = document.createElement('div');
        gameContainer.className = 'blocks-container';
        
        const canvas = document.createElement('canvas');
        canvas.id = 'blocks-canvas';
        canvas.width = 300;
        canvas.height = 600;
        
        const controls = document.createElement('div');
        controls.className = 'blocks-controls';
        controls.innerHTML = `
            <div class="control-info">
                <p><strong>Controls:</strong></p>
                <p>← → Move</p>
                <p>↓ Soft Drop</p>
                <p>↑ Rotate</p>
                <p>Space Hard Drop</p>
            </div>
        `;
        
        gameContainer.appendChild(canvas);
        gameContainer.appendChild(controls);
        
        gameBoard.appendChild(gameInfo);
        gameBoard.appendChild(gameContainer);
        this.container.appendChild(gameBoard);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.setupControls();
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .blocks-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.5rem;
            }
            
            .game-info {
                display: flex;
                gap: 2rem;
                background: rgba(255, 255, 255, 0.1);
                padding: 1rem 2rem;
                border-radius: 12px;
                backdrop-filter: blur(10px);
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
            }
            
            .info-item span:first-child {
                font-size: 0.9rem;
                color: #94a3b8;
            }
            
            .info-item span:last-child {
                font-size: 1.5rem;
                color: #667eea;
            }
            
            .blocks-container {
                display: flex;
                gap: 2rem;
                align-items: flex-start;
            }
            
            #blocks-canvas {
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                background: rgba(0, 0, 0, 0.8);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            
            .blocks-controls {
                background: rgba(255, 255, 255, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                backdrop-filter: blur(10px);
                min-width: 200px;
            }
            
            .control-info p {
                margin: 0.5rem 0;
                font-size: 0.9rem;
            }
            
            .control-info p:first-child {
                margin-bottom: 1rem;
                color: #667eea;
            }
            
            @media (max-width: 768px) {
                .blocks-container {
                    flex-direction: column;
                    align-items: center;
                }
                
                #blocks-canvas {
                    width: 250px;
                    height: 500px;
                }
                
                .game-info {
                    gap: 1rem;
                    padding: 0.75rem 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
        });
    }

    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = {
            shape: this.pieces[pieceIndex][0],
            color: this.colors[pieceIndex],
            type: pieceIndex,
            rotation: 0
        };
        this.currentX = Math.floor((10 - this.currentPiece.shape[0].length) / 2);
        this.currentY = 0;
        
        if (this.collision()) {
            this.gameOver = true;
            this.endGame();
        }
    }

    movePiece(dx, dy) {
        this.currentX += dx;
        this.currentY += dy;
        
        if (this.collision()) {
            this.currentX -= dx;
            this.currentY -= dy;
            
            if (dy > 0) {
                this.placePiece();
                this.clearLines();
                this.spawnPiece();
            }
        }
    }

    rotatePiece() {
        const rotations = this.pieces[this.currentPiece.type];
        const nextRotation = (this.currentPiece.rotation + 1) % rotations.length;
        const oldShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotations[nextRotation];
        this.currentPiece.rotation = nextRotation;
        
        if (this.collision()) {
            this.currentPiece.shape = oldShape;
            this.currentPiece.rotation = (nextRotation - 1 + rotations.length) % rotations.length;
        }
    }

    hardDrop() {
        while (!this.collision()) {
            this.currentY++;
        }
        this.currentY--;
        this.placePiece();
        this.clearLines();
        this.spawnPiece();
    }

    collision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const newX = this.currentX + x;
                    const newY = this.currentY + y;
                    
                    if (newX < 0 || newX >= 10 || newY >= 20) {
                        return true;
                    }
                    
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentY + y;
                    const boardX = this.currentX + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = 19; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(10).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateDisplay();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * 30, y * 30, 30, 30);
                    this.ctx.strokeStyle = '#333';
                    this.ctx.strokeRect(x * 30, y * 30, 30, 30);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const drawX = (this.currentX + x) * 30;
                        const drawY = (this.currentY + y) * 30;
                        this.ctx.fillRect(drawX, drawY, 30, 30);
                        this.ctx.strokeStyle = '#333';
                        this.ctx.strokeRect(drawX, drawY, 30, 30);
                    }
                }
            }
        }
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let x = 0; x <= 10; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * 30, 0);
            this.ctx.lineTo(x * 30, 600);
            this.ctx.stroke();
        }
        for (let y = 0; y <= 20; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * 30);
            this.ctx.lineTo(300, y * 30);
            this.ctx.stroke();
        }
    }

    update(time = 0) {
        const deltaTime = time - this.dropTime;
        this.dropTime = time;
        
        this.dropCounter += deltaTime;
        
        if (this.dropCounter > 1000 - (this.level - 1) * 100) {
            this.movePiece(0, 1);
            this.dropCounter = 0;
        }
        
        this.draw();
        
        if (!this.gameOver) {
            this.gameLoop = requestAnimationFrame((time) => this.update(time));
        }
    }

    updateDisplay() {
        document.getElementById('blocks-score').textContent = this.score;
        document.getElementById('blocks-level').textContent = this.level;
        document.getElementById('blocks-lines').textContent = this.lines;
    }

    startGame() {
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }

    endGame() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        // Draw game over
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '16px Inter';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }

    newGame() {
        this.board = Array(20).fill(null).map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.dropCounter = 0;
        
        this.updateDisplay();
        this.spawnPiece();
        this.startGame();
    }

    cleanup() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
    }
}