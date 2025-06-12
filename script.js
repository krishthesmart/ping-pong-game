const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 20;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_COLOR = "#fff";
const BALL_COLOR = "#09f";
const NET_COLOR = "#fff";
const NET_WIDTH = 4;
const NET_DASH = 20;

// Player paddle
let player = {
    x: PLAYER_X,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0
};

// AI paddle
let ai = {
    x: AI_X,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0
};

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: BALL_RADIUS,
    speed: 6,
    velocityX: 6,
    velocityY: 6
};

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp the paddle within the canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height)
        player.y = canvas.height - player.height;
});

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += NET_DASH * 2) {
        drawRect(canvas.width / 2 - NET_WIDTH / 2, i, NET_WIDTH, NET_DASH, NET_COLOR);
    }
}

function drawScore(text, x, y) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

// Collision detection
function collision(b, p) {
    return b.x - b.radius < p.x + p.width &&
           b.x + b.radius > p.x &&
           b.y - b.radius < p.y + p.height &&
           b.y + b.radius > p.y;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 6;
    ball.velocityY = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);
}

// AI movement (simple)
function moveAI() {
    let target = ball.y - (ai.height / 2);
    // Move paddle towards the ball with some smoothing
    ai.y += (target - ai.y) * 0.09;

    // Clamp AI paddle within the canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height)
        ai.y = canvas.height - ai.height;
}

function update() {
    // Move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Top & bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Which paddle to check
    let paddle = (ball.x < canvas.width / 2) ? player : ai;

    // Paddle collision
    if (collision(ball, paddle)) {
        // Calculate where the ball hit the paddle
        let collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint = collidePoint / (paddle.height / 2);

        // Calculate angle
        let angleRad = collidePoint * (Math.PI / 4);
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;

        // Change velocity and speed up ball
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.3;
    }

    // Left or right wall collision (score)
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    moveAI();
}

function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "#222");
    drawNet();

    // Draw scores
    drawScore(player.score, canvas.width / 4, 50);
    drawScore(ai.score, 3 * canvas.width / 4, 50);

    // Draw paddles and ball
    drawRect(player.x, player.y, player.width, player.height, PADDLE_COLOR);
    drawRect(ai.x, ai.y, ai.width, ai.height, PADDLE_COLOR);
    drawCircle(ball.x, ball.y, ball.radius, BALL_COLOR);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
