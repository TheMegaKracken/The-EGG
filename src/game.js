import { Player } from './player.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from './constants.js';

const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const player = new Player(CANVAS_WIDTH / 2, GROUND_Y);

// --- simple forest background elements ---
const trees = generateTrees();

function generateTrees() {
  const t = [];
  for (let i = 0; i < 12; i++) {
    t.push({
      x: 40 + (i / 11) * (CANVAS_WIDTH - 80),
      layer: i % 3,   // 0 = far, 1 = mid, 2 = near
    });
  }
  return t;
}

function drawBackground() {
  // sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, '#1a2e1a');
  sky.addColorStop(0.6, '#2d5a2d');
  sky.addColorStop(1, '#1a3d1a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // moon
  ctx.save();
  ctx.fillStyle = '#f0e8c0';
  ctx.shadowColor = '#f0e8c0';
  ctx.shadowBlur  = 20;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - 120, 80, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // far trees (dark silhouettes)
  trees.forEach(tree => {
    const layerAlpha = [0.25, 0.45, 0.7][tree.layer];
    const layerScale = [0.6, 0.8, 1.0][tree.layer];
    const layerY     = [GROUND_Y - 10, GROUND_Y - 5, GROUND_Y][tree.layer];
    drawTree(ctx, tree.x, layerY, layerScale, layerAlpha);
  });
}

function drawTree(ctx, x, groundY, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = '#0d1f0d';

  const h = 180 * scale;
  const w = 50  * scale;

  // trunk
  ctx.fillRect(x - 6 * scale, groundY - h * 0.25, 12 * scale, h * 0.25);

  // three tiers of triangle foliage
  for (let i = 0; i < 3; i++) {
    const tierY = groundY - h * (0.2 + i * 0.28);
    const tierW = w * (1.1 - i * 0.25);
    const tierH = h * 0.35;
    ctx.beginPath();
    ctx.moveTo(x, tierY - tierH);
    ctx.lineTo(x - tierW / 2, tierY);
    ctx.lineTo(x + tierW / 2, tierY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawGround() {
  // ground strip
  const gGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
  gGrad.addColorStop(0, '#3a5c2a');
  gGrad.addColorStop(0.15, '#2a4a1a');
  gGrad.addColorStop(1, '#1a2a0a');
  ctx.fillStyle = gGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  // grass edge highlight
  ctx.fillStyle = '#5a8a3a';
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(10, 10, 220, 36);
  ctx.fillStyle = '#c8e8a0';
  ctx.font = '14px monospace';
  ctx.fillText('Arrow / WASD = move   Space / W = jump', 18, 33);
}

// --- game loop ---
let lastTime = null;

function loop(timestamp) {
  const dt = lastTime == null ? 0 : Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  player.update(dt);

  // draw
  drawBackground();
  drawGround();
  player.draw(ctx);
  drawHUD();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
