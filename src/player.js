import * as Input from './input.js';
import {
  GRAVITY, MOVE_SPEED, JUMP_VELOCITY, GROUND_Y,
  COYOTE_TIME, JUMP_BUFFER_TIME, PLAYER_W, PLAYER_H
} from './constants.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.onGround = false;
    this.coyoteTimer   = 0;
    this.jumpBuffer    = 0;   // counts down after jump pressed

    // visual
    this.facingRight = true;
    this.squishY = 1;         // scale for landing squish
    this.squishVel = 0;
  }

  get left()   { return this.x - PLAYER_W / 2; }
  get right()  { return this.x + PLAYER_W / 2; }
  get top()    { return this.y - PLAYER_H; }
  get bottom() { return this.y; }

  update(dt) {
    // --- horizontal movement ---
    const moveX = (Input.isRight() ? 1 : 0) - (Input.isLeft() ? 1 : 0);
    if (moveX !== 0) this.facingRight = moveX > 0;

    this.vx = moveX * MOVE_SPEED;

    // --- jump buffer (remember jump press for a short window) ---
    if (Input.isJump()) {
      this.jumpBuffer = JUMP_BUFFER_TIME;
    }
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    // --- coyote time ---
    if (this.onGround) {
      this.coyoteTimer = COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // --- apply jump ---
    if (this.jumpBuffer > 0 && this.coyoteTimer > 0) {
      this.vy = JUMP_VELOCITY;
      this.coyoteTimer = 0;
      this.jumpBuffer  = 0;
      // stretch upward on jump
      this.squishY   = 0.65;
      this.squishVel = 0;
    }

    // --- variable jump height: release early = lower jump ---
    if (!Input.isJump() && this.vy < 0) {
      this.vy += GRAVITY * 0.6 * dt; // extra gravity cuts the arc short
    }

    // --- gravity ---
    this.vy += GRAVITY * dt;

    // --- integrate position ---
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // --- ground collision ---
    const wasOnGround = this.onGround;
    this.onGround = false;

    if (this.y >= GROUND_Y) {
      this.y  = GROUND_Y;
      if (this.vy > 0) {
        // squish on landing proportional to fall speed
        const impact = Math.min(Math.abs(this.vy) / 1200, 0.45);
        this.squishY   = 1 - impact;
        this.squishVel = 0;
      }
      this.vy = 0;
      this.onGround = true;
    }

    // --- squish spring (damped spring toward scale=1) ---
    this.squishVel += (1 - this.squishY) * 22 * dt;
    this.squishVel -= this.squishVel * 7 * dt;
    this.squishY   += this.squishVel;
    this.squishY    = Math.max(0.55, Math.min(1.4, this.squishY));

    // --- wall clamp ---
    const halfW = PLAYER_W / 2;
    if (this.x < halfW)                    this.x = halfW;
    if (this.x > 1280 - halfW)             this.x = 1280 - halfW;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const scaleX = this.facingRight ? 1 : -1;
    const scaleY = this.squishY;
    ctx.scale(scaleX, 1);

    // egg body — bottom-anchored so squish looks right
    ctx.save();
    ctx.scale(1, scaleY);
    ctx.translate(0, -PLAYER_H);

    // shell gradient
    const grad = ctx.createRadialGradient(-6, -8, 2, 0, 0, PLAYER_W * 0.9);
    grad.addColorStop(0, '#fffff0');
    grad.addColorStop(0.6, '#f5e6c8');
    grad.addColorStop(1, '#d4b896');

    ctx.beginPath();
    ctx.ellipse(0, PLAYER_H * 0.5, PLAYER_W / 2, PLAYER_H / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // subtle shell outline
    ctx.strokeStyle = 'rgba(160,120,80,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // shine spot
    ctx.beginPath();
    ctx.ellipse(-7, PLAYER_H * 0.2, 5, 3, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();

    // tiny face
    const eyeY  = PLAYER_H * 0.45;
    const eyeX  = 5;
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // gleam
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(eyeX + 1, eyeY - 1, 1.2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // undo Y squish
    ctx.restore(); // undo translate + flip
  }
}
