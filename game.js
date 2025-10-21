const bunnyEl = document.getElementById('bunny');
const platformEl = document.getElementById('platform');
const nextPlatformEl = document.getElementById('next-platform');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageEl = document.getElementById('message');

const COLORS = ['#f8b4d9', '#bfe7ff', '#d6f8e0', '#fbe7b3'];
let colorIndex = 0;
let colorInterval = null;
let score = 0;
let lives = 3;
let colorSpeed = 900;
let combo = 0;
let bunnyColorIndex = Math.floor(Math.random() * COLORS.length);
let gameOverFlag = false;

// 🎨 Utility: Convert hex → rgba
function rgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// 🌈 Apply color to element
function applyColor(el, idx) {
  el.style.backgroundColor = COLORS[idx];
}

function setBunnyColor(idx) {
  bunnyEl.style.background = COLORS[idx];
  bunnyEl.dataset.colorIndex = idx;
}

function updateMatchIndicator() {
  if (Number(bunnyEl.dataset.colorIndex) === colorIndex) {
    bunnyEl.style.transform = 'translateY(-6px) scale(1.05)';
    bunnyEl.style.boxShadow = `0 12px 28px ${rgba(COLORS[colorIndex], 0.25)}`;
  } else {
    bunnyEl.style.transform = 'translateY(0) scale(1)';
    bunnyEl.style.boxShadow = '0 8px 18px rgba(0,0,0,0.06)';
  }
}

function startColorCycle(intervalMs = colorSpeed) {
  if (colorInterval) clearInterval(colorInterval);
  applyColor(platformEl, colorIndex);
  updateMatchIndicator();
  colorInterval = setInterval(() => {
    colorIndex = (colorIndex + 1) % COLORS.length;
    applyColor(platformEl, colorIndex);
    updateMatchIndicator();
  }, intervalMs);
}

function stopColorCycle() {
  if (colorInterval) clearInterval(colorInterval);
  colorInterval = null;
}

// 🐰 Handle jump logic
function handleJump() {
  if (gameOverFlag) return;

  const match = Number(bunnyEl.dataset.colorIndex) === colorIndex;

  if (match) {
    score++;
    combo++;

    // Speed up every 5 perfect jumps
    if (combo % 5 === 0 && colorSpeed > 400) {
      colorSpeed -= 100;
      restartColorCycle();
      showComboText(`Speed Up!`);
    } else if (combo > 1) {
      showComboText(`x${combo} Combo!`);
    }

    scoreEl.textContent = `💖 Score: ${score}`;
    showPlusOne();

    const bunnyRect = bunnyEl.getBoundingClientRect();
    createSparkles(bunnyRect.left + bunnyRect.width / 2, bunnyRect.top);

    jumpToNextPlatform();
  } else {
    triggerFall();
  }
}

function jumpToNextPlatform() {
  const nextColorIdx = Math.floor(Math.random() * COLORS.length);
  applyColor(nextPlatformEl, nextColorIdx);
  nextPlatformEl.classList.remove('hidden');
  nextPlatformEl.style.left = '100%';

  setTimeout(() => {
    nextPlatformEl.style.left = '0%';
  }, 50);

  bunnyEl.style.transition = 'transform 0.4s ease-out';
  bunnyEl.style.transform = 'translateY(-120px) scale(1.05)';
  setTimeout(() => {
    bunnyEl.style.transform = 'translateY(0) scale(1)';
  }, 400);

  bunnyColorIndex = nextColorIdx;
  setBunnyColor(bunnyColorIndex);
  colorIndex = Math.floor(Math.random() * COLORS.length);
  applyColor(platformEl, colorIndex);
  updateMatchIndicator();
}

// 💔 Game over
function triggerFall() {
  lives--;
  livesEl.textContent = `🐇 Lives: ${lives}`;

  if (lives <= 0) {
    gameOverFlag = true;
    stopColorCycle();
    bunnyEl.classList.add('falling');
    messageEl.textContent = 'Game Over 💔 Press SPACE to restart';
    messageEl.classList.remove('hidden');
    combo = 0;
    colorSpeed = 900;
  } else {
    // small “bonk” animation for missed jump
    bunnyEl.style.transition = 'transform 0.2s ease';
    bunnyEl.style.transform = 'translateY(20px) scale(0.95)';
    setTimeout(() => {
      bunnyEl.style.transform = 'translateY(0) scale(1)';
    }, 300);
  }
}

// 🔁 Restart
function restartGame() {
  gameOverFlag = false;
  bunnyEl.classList.remove('falling');
  bunnyEl.style.transform = 'translateY(0) scale(1)';
  score = 0;
  combo = 0;
  lives = 3;

  scoreEl.textContent = `💖 Score: ${score}`;
  livesEl.textContent = `🐇 Lives: ${lives}`;

  colorIndex = 0;
  bunnyColorIndex = Math.floor(Math.random() * COLORS.length);
  setBunnyColor(bunnyColorIndex);
  applyColor(platformEl, colorIndex);
  nextPlatformEl.classList.add('hidden');
  messageEl.classList.add('hidden');
  startColorCycle();
}

function restartColorCycle() {
  stopColorCycle();
  startColorCycle(colorSpeed);
}

// ✨ Visual effects
function showComboText(text) {
  const comboEl = document.createElement('div');
  comboEl.classList.add('plus-one');
  comboEl.textContent = text;
  const bunnyRect = bunnyEl.getBoundingClientRect();
  comboEl.style.left = `${bunnyRect.left + bunnyRect.width / 2 - 20}px`;
  comboEl.style.top = `${bunnyRect.top - 40}px`;
  document.body.appendChild(comboEl);
  setTimeout(() => comboEl.remove(), 900);
}

function showPlusOne() {
  const plus = document.createElement('div');
  plus.classList.add('plus-one');
  plus.textContent = '+1';
  const bunnyRect = bunnyEl.getBoundingClientRect();
  plus.style.left = `${bunnyRect.left + bunnyRect.width / 2 - 10}px`;
  plus.style.top = `${bunnyRect.top - 10}px`;
  document.body.appendChild(plus);
  setTimeout(() => plus.remove(), 800);
}

function createSparkles(x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.classList.add('sparkle');
    document.body.appendChild(s);
    const offsetX = (Math.random() - 0.5) * 80;
    const offsetY = (Math.random() - 0.5) * 40;
    s.style.left = `${x + offsetX}px`;
    s.style.top = `${y + offsetY}px`;
    s.style.animationDelay = `${Math.random() * 0.2}s`;
    setTimeout(() => s.remove(), 800);
  }
}

// 🧩 Initial setup
setBunnyColor(bunnyColorIndex);
applyColor(platformEl, colorIndex);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!colorInterval && !gameOverFlag) {
      messageEl.classList.add('hidden');
      startColorCycle();
    } else if (gameOverFlag) {
      restartGame();
    } else {
      handleJump();
    }
  }
});

document.getElementById('stage').addEventListener('pointerdown', () => {
  if (!colorInterval && !gameOverFlag) {
    messageEl.classList.add('hidden');
    startColorCycle();
  } else if (gameOverFlag) {
    restartGame();
  } else {
    handleJump();
  }
});
