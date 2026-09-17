const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const restartButton = document.getElementById('restartButton');

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

const state = {
  running: true,
  score: 0,
  lives: 3,
  lastTime: 0,
  spawnTimer: 0,
  enemySpeed: 180,
};

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 50,
  speed: 260,
};

const enemies = [];

function updateHud() {
  scoreEl.textContent = String(Math.floor(state.score));
  livesEl.textContent = String(state.lives);
}

function resetPlayer() {
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 80;
}

function resetGame() {
  state.running = true;
  state.score = 0;
  state.lives = 3;
  state.spawnTimer = 0.8;
  state.enemySpeed = 180;
  enemies.length = 0;
  resetPlayer();
  updateHud();
}

function spawnEnemy() {
  const size = 22 + Math.random() * 18;
  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    speed: state.enemySpeed + Math.random() * 110,
  });
}

function movePlayer(dt) {
  if (keys.ArrowLeft) player.x -= player.speed * dt;
  if (keys.ArrowRight) player.x += player.speed * dt;
  if (keys.ArrowUp) player.y -= player.speed * dt;
  if (keys.ArrowDown) player.y += player.speed * dt;

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.width > b.x &&
    a.y < b.y + b.size &&
    a.y + a.height > b.y
  );
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    enemy.y += enemy.speed * dt;

    if (enemy.y > canvas.height + enemy.size) {
      enemies.splice(i, 1);
      state.score += 10;
      continue;
    }

    if (isColliding(player, enemy)) {
      enemies.splice(i, 1);
      state.lives -= 1;
      updateHud();

      if (state.lives <= 0) {
        state.running = false;
      } else {
        resetPlayer();
      }
    }
  }
}

function update(dt) {
  if (!state.running) return;

  movePlayer(dt);
  state.spawnTimer -= dt;
  state.enemySpeed += dt * 7;

  if (state.spawnTimer <= 0) {
    spawnEnemy();
    state.spawnTimer = Math.max(0.45, 1.2 - state.score / 500);
  }

  updateEnemies(dt);
  state.score += dt * 6;
  updateHud();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#f87171';
  for (const enemy of enemies) {
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, enemy.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!state.running) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px sans-serif';
    ctx.fillText(`最終スコア: ${Math.floor(state.score)}`, canvas.width / 2, canvas.height / 2 + 30);
  }
}

function loop(timestamp) {
  const dt = Math.min((timestamp - state.lastTime) / 1000 || 0, 0.033);
  state.lastTime = timestamp;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

restartButton.addEventListener('click', () => {
  resetGame();
});

resetGame();
requestAnimationFrame(loop);
