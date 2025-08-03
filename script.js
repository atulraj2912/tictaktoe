// Game State Management
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'single'; // 'single' or 'series'
        this.seriesScore = { X: 0, O: 0 };
        this.currentGame = 1;
        this.maxGames = 5;
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Board cell clicks
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
            
            // Touch events for better mobile experience
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                cell.style.transform = 'scale(0.95)';
            });
            
            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                cell.style.transform = '';
                // Trigger click after a short delay to ensure visual feedback
                setTimeout(() => {
                    if (cell.textContent === '' && this.gameActive) {
                        this.handleCellClick(e);
                    }
                }, 50);
            });
            
            cell.addEventListener('touchcancel', (e) => {
                cell.style.transform = '';
            });
        });
        
        // Add click sound effect (visual feedback)
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', () => {
                if (cell.textContent === '') {
                    this.addClickEffect(cell);
                }
            });
        });
        
        // Prevent zoom on double tap for mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.makeMove(index, cell);
    }
    
    makeMove(index, cell) {
        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Add animation effect
        cell.style.animation = 'scaleIn 0.3s ease-out';
        
        if (this.checkWinner()) {
            this.handleGameEnd('win');
        } else if (this.checkDraw()) {
            this.handleGameEnd('draw');
        } else {
            this.switchPlayer();
        }
    }
    
    checkWinner() {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(condition);
                return this.board[a];
            }
        }
        return null;
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    highlightWinningCells(winningIndexes) {
        winningIndexes.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.classList.add('winning');
        });
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    handleGameEnd(result) {
        this.gameActive = false;
        
        if (this.gameMode === 'single') {
            this.showGameResult(result);
        } else {
            this.handleSeriesGame(result);
        }
    }
    
    handleSeriesGame(result) {
        if (result === 'win') {
            this.seriesScore[this.currentPlayer]++;
        }
        
        this.updateSeriesDisplay();
        
        // Check if series is complete after this game
        const isSeriesComplete = this.currentGame >= this.maxGames || 
                                this.seriesScore.X > Math.floor(this.maxGames / 2) || 
                                this.seriesScore.O > Math.floor(this.maxGames / 2);
        
        if (isSeriesComplete) {
            // Show game result first, then series winner
            this.showGameResult(result, true, true); // true for isSeries, true for isLastGame
        } else {
            this.showGameResult(result, true, false); // true for isSeries, false for isLastGame
        }
    }
    
    showGameResult(result, isSeries = false, isLastGame = false) {
        const modal = document.getElementById('result-modal');
        const resultIcon = document.getElementById('result-icon');
        const resultText = document.getElementById('result-text');
        const resultDetails = document.getElementById('result-details');
        const continueBtn = document.getElementById('continue-btn');
        
        if (result === 'win') {
            resultIcon.textContent = '🎉';
            resultText.textContent = `Player ${this.currentPlayer} Wins!`;
            resultDetails.textContent = isSeries ? 
                `Game ${this.currentGame} completed${isLastGame ? ' - Series Finished!' : ''}` : 
                'Congratulations on your victory!';
        } else {
            resultIcon.textContent = '🤝';
            resultText.textContent = "It's a Draw!";
            resultDetails.textContent = isSeries ? 
                `Game ${this.currentGame} ended in a tie${isLastGame ? ' - Series Finished!' : ''}` : 
                'Good game! Try again!';
        }
        
        if (isSeries) {
            if (isLastGame) {
                continueBtn.textContent = 'View Series Results';
                continueBtn.onclick = () => {
                    this.hideModals();
                    this.showSeriesWinner();
                };
            } else {
                continueBtn.textContent = 'Next Game';
                continueBtn.onclick = () => this.nextSeriesGame();
            }
        } else {
            continueBtn.textContent = 'Play Again';
            continueBtn.onclick = () => this.resetGame();
        }
        
        modal.classList.remove('hidden');
    }
    
    showSeriesWinner() {
        const modal = document.getElementById('winner-modal');
        const winnerText = document.getElementById('winner-text');
        const finalScore = document.getElementById('final-score');
        
        const winner = this.seriesScore.X > this.seriesScore.O ? 'X' : 
                      this.seriesScore.O > this.seriesScore.X ? 'O' : 'tie';
        
        if (winner === 'tie') {
            winnerText.textContent = 'Series Tied!';
            finalScore.textContent = `Final Score: ${this.seriesScore.X} - ${this.seriesScore.O}`;
        } else {
            winnerText.textContent = `Player ${winner} Wins the Series!`;
            finalScore.textContent = `Final Score: ${this.seriesScore.X} - ${this.seriesScore.O}`;
        }
        
        modal.classList.remove('hidden');
        
        // Add celebration effect
        this.addCelebrationEffect();
    }
    
    nextSeriesGame() {
        this.currentGame++;
        
        // Check if we should end the series after incrementing
        const isSeriesComplete = this.currentGame > this.maxGames || 
                                this.seriesScore.X > Math.floor(this.maxGames / 2) || 
                                this.seriesScore.O > Math.floor(this.maxGames / 2);
        
        if (isSeriesComplete) {
            this.hideModals();
            this.showSeriesWinner();
        } else {
            this.resetBoard();
            this.updateSeriesDisplay();
            this.hideModals();
            // Show starting player selection for the next game
            this.showStartingPlayerModal();
        }
    }
    
    resetGame() {
        this.resetBoard();
        this.hideModals();
    }
    
    resetBoard() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        
        // For series mode, don't activate the game until starting player is chosen
        if (this.gameMode === 'series') {
            this.gameActive = false;
        } else {
            this.gameActive = true;
        }
        
        // Clear board display
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.animation = '';
        });
        
        this.updateDisplay();
    }
    
    newSeries() {
        this.gameMode = 'series';
        this.seriesScore = { X: 0, O: 0 };
        this.currentGame = 1;
        this.hideModals();
        this.resetBoard();
        this.updateSeriesDisplay();
        
        // Show series progress
        document.getElementById('series-progress').classList.remove('hidden');
        document.getElementById('new-series-btn').classList.remove('hidden');
        document.getElementById('game-mode-display').textContent = 'Series Mode (Best of 5)';
        
        // Show starting player selection for the first game
        setTimeout(() => {
            this.showStartingPlayerModal();
        }, 100);
    }
    
    updateDisplay() {
        const currentPlayerDisplay = document.getElementById('current-player');
        if (this.gameActive) {
            currentPlayerDisplay.textContent = `Player ${this.currentPlayer}'s Turn`;
            currentPlayerDisplay.style.color = this.currentPlayer === 'X' ? '#FF6B6B' : '#4ECDC4';
        }
    }
    
    updateSeriesDisplay() {
        if (this.gameMode === 'series') {
            document.getElementById('score-x').textContent = this.seriesScore.X;
            document.getElementById('score-o').textContent = this.seriesScore.O;
            document.getElementById('game-counter').textContent = `Game ${this.currentGame} of ${this.maxGames}`;
        }
    }
    
    hideModals() {
        document.getElementById('result-modal').classList.add('hidden');
        document.getElementById('winner-modal').classList.add('hidden');
        document.getElementById('starting-player-modal').classList.add('hidden');
    }
    
    showStartingPlayerModal() {
        const modal = document.getElementById('starting-player-modal');
        const gameNumberDisplay = document.getElementById('game-number-display');
        
        gameNumberDisplay.textContent = `Game ${this.currentGame} of ${this.maxGames}`;
        modal.classList.remove('hidden');
    }
    
    setStartingPlayer(player) {
        this.currentPlayer = player;
        this.gameActive = true;
        this.updateDisplay();
        document.getElementById('starting-player-modal').classList.add('hidden');
    }
    
    addClickEffect(cell) {
        cell.style.transform = 'scale(0.95)';
        setTimeout(() => {
            cell.style.transform = '';
        }, 100);
    }
    
    addCelebrationEffect() {
        // Create floating emojis
        const emojis = ['🎉', '🎊', '🏆', '⭐', '🎯'];
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
            }, i * 200);
        }
    }
    
    createFloatingEmoji(emoji) {
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;
        emojiElement.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: floatUp 3s ease-out forwards;
        `;
        
        // Add floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                to {
                    transform: translateY(-${window.innerHeight + 100}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(emojiElement);
        
        setTimeout(() => {
            emojiElement.remove();
            style.remove();
        }, 3000);
    }
}

// Global game instance
let game;

// Screen Management Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    showScreen('welcome-screen');
    if (game) {
        game.hideModals();
        
        // Clear any lingering animations or effects
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.animation = '';
            cell.style.transform = '';
        });
    }
}

function startSingleGame() {
    showScreen('game-screen');
    
    // Create fresh game instance
    game = new TicTacToeGame();
    game.gameMode = 'single';
    
    // Ensure complete UI reset
    game.resetBoard();
    game.hideModals();
    
    // Hide series elements and reset UI
    document.getElementById('series-progress').classList.add('hidden');
    document.getElementById('new-series-btn').classList.add('hidden');
    document.getElementById('game-mode-display').textContent = 'Single Game';
    
    // Reset any lingering visual effects
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.style.animation = '';
        cell.style.transform = '';
    });
    
    // Update current player display
    game.updateDisplay();
}

function startSeries() {
    showScreen('game-screen');
    
    // Create fresh game instance
    game = new TicTacToeGame();
    game.newSeries();
    
    // Ensure complete reset
    game.hideModals();
    
    // Reset any lingering visual effects
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.style.animation = '';
        cell.style.transform = '';
    });
}

function resetGame() {
    if (game) {
        game.resetGame();
    }
}

function newSeries() {
    if (game) {
        game.newSeries();
    }
}

function continueGame() {
    if (game) {
        if (game.gameMode === 'series') {
            game.nextSeriesGame();
        } else {
            game.resetGame();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add some initial animations
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Add keyboard support (only for non-touch devices)
    if (!('ontouchstart' in window)) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                goHome();
            }
            
            // Number keys for cell selection (1-9)
            if (game && game.gameActive && e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                const cell = document.querySelector(`[data-index="${index}"]`);
                if (cell && cell.textContent === '') {
                    cell.click();
                }
            }
        });
    }
    
    // Add mouse trail effect (only for desktop)
    let mouseTrail = [];
    if (!('ontouchstart' in window)) {
        document.addEventListener('mousemove', (e) => {
            mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            
            // Remove old trail points
            mouseTrail = mouseTrail.filter(point => Date.now() - point.time < 500);
            
            // Create trail effect on welcome screen
            if (document.getElementById('welcome-screen').classList.contains('active')) {
                if (Math.random() < 0.1) { // 10% chance to create a sparkle
                    createSparkle(e.clientX, e.clientY);
                }
            }
        });
    }
    
    // Handle orientation changes on mobile
    if ('ontouchstart' in window) {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Force a repaint to fix any layout issues
                document.body.style.display = 'none';
                document.body.offsetHeight; // Trigger reflow
                document.body.style.display = '';
                
                // Update viewport height for mobile browsers
                document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            }, 100);
        });
        
        // Set initial viewport height
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    
    // Prevent pull-to-refresh on mobile
    document.body.addEventListener('touchstart', e => {
        if (e.touches.length === 1 && e.touches[0].clientY <= 50) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.body.addEventListener('touchmove', e => {
        if (e.touches.length === 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Apple-style Namaste screen transition
    setTimeout(() => {
        const namasteScreen = document.getElementById('namaste-screen');
        const welcomeScreen = document.getElementById('welcome-screen');
        
        // Fade out namaste screen
        namasteScreen.classList.add('fade-out');
        
        // After fade out, show welcome screen
        setTimeout(() => {
            namasteScreen.style.display = 'none';
            welcomeScreen.classList.add('active');
        }, 1000);
    }, 3000); // Show namaste for 3 seconds
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${x}px;
        top: ${y}px;
        animation: sparkleAnimation 1s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

// Add sparkle animation
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleAnimation {
        0% {
            opacity: 1;
            transform: scale(0);
        }
        50% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }
`;
document.head.appendChild(sparkleStyle);

// Add some initial body styling
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease-in';

// Global function for choosing starting player
function chooseStartingPlayer(player) {
    if (game) {
        game.setStartingPlayer(player);
    }
}
