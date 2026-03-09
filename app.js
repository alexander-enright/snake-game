// NEON SNAKE - Classic Arcade Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('gameOverlay');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameSpeed = 100;
let isGameRunning = false;
let isPaused = false;

// Colors
const colors = {
    snake: '#00ff88',
    snakeGlow: '#00ff88',
    food: '#ff3366',
    foodGlow: '#ff3366',
    background: '#0a0a0a',
    grid: '#1a1a1a'
};

// Initialize
highScoreDisplay.textContent = highScore;

function initGame() {
    // Reset snake to center
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameSpeed = 100;
    scoreDisplay.textContent = score;
    
    spawnFood();
}

function spawnFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (isSnakeAt(food.x, food.y));
}

function isSnakeAt(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

function update() {
    if (isPaused || !isGameRunning) return;
    
    // Apply next direction
    direction = { ...nextDirection };
    
    // Calculate new head position
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (isSnakeAt(head.x, head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Increase speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
        
        spawnFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (subtle)
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw food with glow
    ctx.shadowColor = colors.foodGlow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = colors.food;
    
    // Pulsing effect for food
    const pulse = Math.sin(Date.now() / 200) * 2;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        (gridSize / 2 - 2) + pulse,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw snake with glow
    ctx.shadowColor = colors.snakeGlow;
    ctx.shadowBlur = 15;
    ctx.fillStyle = colors.snake;
    
    snake.forEach((segment, index) => {
        // Head is brighter
        if (index === 0) {
            ctx.fillStyle = '#00ffaa';
        } else {
            ctx.fillStyle = colors.snake;
        }
        
        // Draw rounded rectangle for segments
        const x = segment.x * gridSize + 1;
        const y = segment.y * gridSize + 1;
        const size = gridSize - 2;
        const radius = 4;
        
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.fill();
    });
    
    // Reset shadow for next frame
    ctx.shadowBlur = 0;
}

function gameStep() {
    update();
    draw();
}

function startGame() {
    if (isGameRunning) {
        // Restart if already running
        clearInterval(gameLoop);
    }
    
    isGameRunning = true;
    isPaused = false;
    overlay.classList.add('hidden');
    initGame();
    gameLoop = setInterval(gameStep, gameSpeed);
}

function togglePause() {
    if (!isGameRunning) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        overlayTitle.textContent = 'PAUSED';
        overlayText.textContent = 'Press PAUSE to resume';
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    
    overlayTitle.textContent = 'GAME OVER';
    overlayText.textContent = `Score: ${score} | Press SPACE to restart`;
    overlay.classList.remove('hidden');
}

function setDirection(dir) {
    if (!isGameRunning || isPaused) return;
    
    switch(dir) {
        case 'up':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'down':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'left':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'right':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isGameRunning || (isGameRunning && !isPaused && document.getElementById('overlayTitle').textContent === 'GAME OVER')) {
            startGame();
        } else if (isPaused) {
            togglePause();
        }
        return;
    }
    
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (isGameRunning) togglePause();
        return;
    }
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            setDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            setDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            setDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            setDirection('right');
            break;
    }
});

// Initial draw
draw();

console.log('🐍 Snake game loaded! Press SPACE to start');