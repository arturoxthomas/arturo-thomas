const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const retryBtn = document.getElementById('retry-btn');

let gameSpeed = 5;
let score = 0;
let highScore = localStorage.getItem('techRunnerHighScore') || 0;
let isPlaying = true;
let obstacles = [];
let nextObstacleTimer = 0;

highScoreElement.textContent = highScore;

const player = {
    x: 50,
    y: 200,
    width: 30,
    height: 40,
    gravity: 0.6,
    jumpForce: -12,
    velocityY: 0,
    isGrounded: true
};

function handleJump() {
    if (player.isGrounded && isPlaying) {
        player.velocityY = player.jumpForce;
        player.isGrounded = false;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
}, { passive: false });

retryBtn.addEventListener('click', resetGame);

function spawnObstacle() {
    const types = [
        { name: 'Bug', width: 20, height: 30, color: '#ff3333' },
        { name: 'Cable', width: 45, height: 15, color: '#ffcc00' },
        { name: 'Server', width: 30, height: 45, color: '#0099ff' }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push({
        x: canvas.width,
        y: canvas.height - type.height - 10,
        width: type.width,
        height: type.height,
        color: type.color
    });
}

function update() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 10);
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.stroke();

    player.velocityY += player.gravity;
    player.y += player.velocityY;

    const groundLevel = canvas.height - player.height - 10;
    if (player.y >= groundLevel) {
        player.y = groundLevel;
        player.velocityY = 0;
        player.isGrounded = true;
    }

    ctx.fillStyle = '#00ff66';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#111216';
    ctx.fillRect(player.x + 15, player.y + 8, 15, 6);

    nextObstacleTimer--;
    if (nextObstacleTimer <= 0) {
        spawnObstacle();
        nextObstacleTimer = Math.floor(Math.random() * 50) + 60;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            endGame();
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            scoreElement.textContent = score;
            if (score % 5 === 0) {
                gameSpeed += 0.5;
            }
        }
    }

    requestAnimationFrame(update);
}

function endGame() {
    isPlaying = false;
    gameOverScreen.classList.remove('hidden');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('techRunnerHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function resetGame() {
    obstacles = [];
    score = 0;
    gameSpeed = 5;
    player.y = canvas.height - player.height - 10;
    player.velocityY = 0;
    player.isGrounded = true;
    scoreElement.textContent = score;
    gameOverScreen.classList.add('hidden');
    isPlaying = true;
    nextObstacleTimer = 0;
    update();
}

update();