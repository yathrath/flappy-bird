const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

const game = {
    bird: { x: 100, y: 300, velocity: 0, radius: 16, wingPhase: 0 },
    pipes: [], score: 0, started: false, gameOver: false, lastPipe: 0, worldTime: 0
};

function resetGame() {
    game.bird.y = 300;
    game.bird.velocity = 0;
    game.pipes = [];
    game.score = 0;
    game.started = true;
    game.gameOver = false;
    game.lastPipe = 0;
    game.worldTime = 0;
    status.className = "start-message";
    status.innerHTML = `<span class="status-icon" aria-hidden="true">↑</span><strong>Ready to fly?</strong><span>Press Space or tap to flap</span>`;
    flap();
}

function flap() {
    if (game.gameOver) {
        resetGame();
        return;
    }
    game.started = true;
    game.bird.velocity = -8;
}

function addPipe() {
    const gapTop = 90 + Math.random() * 260;
    game.pipes.push({ x: canvas.width, width: 58, gapTop, gapBottom: gapTop + 155, passed: false });
}

function endGame() {
    game.gameOver = true;
    status.className = "game-over-popup";
    status.innerHTML = `<span class="popup-kicker">Flight complete</span><strong>Game over</strong><span class="final-score-label">Your score</span><span class="final-score">${game.score}</span><span class="restart-hint">Tap or press Space to fly again</span>`;
}

function update(delta) {
    game.worldTime += delta;
    game.bird.wingPhase += delta;
    if (!game.started || game.gameOver) return;
    game.bird.velocity += 0.5 * delta;
    game.bird.y += game.bird.velocity * delta;
    game.lastPipe += delta / 60;
    if (game.lastPipe > 1.45) {
        addPipe();
        game.lastPipe = 0;
    }
    for (const pipe of game.pipes) {
        pipe.x -= 3 * delta;
        if (!pipe.passed && pipe.x + pipe.width < game.bird.x) {
            pipe.passed = true;
            game.score += 1;
        }
        const overlaps = game.bird.x + game.bird.radius > pipe.x && game.bird.x - game.bird.radius < pipe.x + pipe.width;
        const hitsPipe = game.bird.y - game.bird.radius < pipe.gapTop || game.bird.y + game.bird.radius > pipe.gapBottom;
        if (overlaps && hitsPipe) endGame();
    }
    game.pipes = game.pipes.filter(pipe => pipe.x + pipe.width > 0);
    if (game.bird.y - game.bird.radius < 0 || game.bird.y + game.bird.radius > canvas.height) endGame();
}

function drawCloud(x, y, scale) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.beginPath();
    ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
    ctx.arc(x + 22 * scale, y - 9 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 52 * scale, y, 17 * scale, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipe(pipe) {
    const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    pipeGradient.addColorStop(0, "#267c48");
    pipeGradient.addColorStop(0.35, "#56b85b");
    pipeGradient.addColorStop(1, "#17613d");
    ctx.fillStyle = pipeGradient;
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapTop);
    ctx.fillRect(pipe.x, pipe.gapBottom, pipe.width, canvas.height - pipe.gapBottom);
    ctx.fillStyle = "#1f7043";
    ctx.fillRect(pipe.x - 5, pipe.gapTop - 18, pipe.width + 10, 18);
    ctx.fillRect(pipe.x - 5, pipe.gapBottom, pipe.width + 10, 18);
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(pipe.x + 9, 0, 7, pipe.gapTop - 18);
    ctx.fillRect(pipe.x + 9, pipe.gapBottom + 18, 7, canvas.height - pipe.gapBottom - 18);
}

function drawBird() {
    const wingLift = Math.sin(game.bird.wingPhase * 0.45) * 3;
    ctx.save();
    ctx.translate(game.bird.x, game.bird.y);
    ctx.rotate(Math.min(Math.max(game.bird.velocity * 0.045, -0.25), 0.65));
    ctx.strokeStyle = "#9a4d22";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#f5a623";
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffd45c";
    ctx.beginPath();
    ctx.ellipse(-5, 5 + wingLift, 11, 7, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(9, -7, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#17324d";
    ctx.beginPath();
    ctx.arc(11, -7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ed713c";
    ctx.beginPath();
    ctx.moveTo(17, -2);
    ctx.lineTo(31, 2);
    ctx.lineTo(17, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#48b9df");
    sky.addColorStop(0.72, "#b8e6dc");
    sky.addColorStop(1, "#f9d98d");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 231, 142, 0.7)";
    ctx.beginPath();
    ctx.arc(314, 106, 43, 0, Math.PI * 2);
    ctx.fill();
    drawCloud(45 - (game.worldTime * 0.12) % 480, 115, 0.8);
    drawCloud(260 - (game.worldTime * 0.08) % 480, 190, 0.55);

    ctx.fillStyle = "#79b6a0";
    ctx.beginPath();
    ctx.moveTo(0, 390);
    for (let x = 0; x <= canvas.width; x += 70) ctx.lineTo(x, 350 + Math.sin(x * 0.025) * 30);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
    for (const pipe of game.pipes) drawPipe(pipe);
    ctx.fillStyle = "#78c653";
    ctx.fillRect(0, canvas.height - 34, canvas.width, 34);
    ctx.fillStyle = "#d5a451";
    ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
    ctx.fillStyle = "rgba(125, 82, 42, 0.28)";
    for (let x = -20; x < canvas.width; x += 38) ctx.fillRect(x - (game.worldTime * 3) % 38, canvas.height - 19, 20, 3);
    drawBird();
}

let previousTime = 0;
function gameLoop(time) {
    const delta = Math.min((time - previousTime) / 16.67, 2);
    previousTime = time;
    update(delta);
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("pointerdown", flap);
document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        flap();
    }
});

draw();
requestAnimationFrame(gameLoop);