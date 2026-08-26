// src/game.js
import { MAZE, TILE, PELLET_COUNT } from './config.js';
import { Pacman } from './pacman.js';
import { Ghost } from './ghosts.js';
import { InputHandler } from './input.js';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileSize = TILE.SIZE;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pacman-high') || '0', 10);
    this.lives = 3;
    this.state = 'ready'; // ready, playing, dead, gameover, win
    this.deathTimer = 0;
    this.pelletCount = PELLET_COUNT;
    this.frightenedTimer = 0;
    this.frightenedDuration = 400;
    this.ghostEatCombo = 0;
    this.lastTime = 0;
    this.readyTimer = 0;

    this.input = new InputHandler();
    this.pacman = new Pacman();
    this.ghosts = [
      new Ghost(7, 10, 'blinky', '#FF0000'),
      new Ghost(7, 12, 'pinky', '#FFB8FF'),
      new Ghost(5, 12, 'inky', '#00FFFF'),
      new Ghost(9, 12, 'clyde', '#FFB852'),
    ];
    this.ghosts.forEach(g => g.setMode('scatter'));

    this.dots = [];
    this.powerPellets = [];
    this.resetMaze();

    this.updateHUD();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resetMaze() {
    this.dots = [];
    this.powerPellets = [];
    for (let y = 0; y < MAZE.ROWS; y++) {
      for (let x = 0; x < MAZE.COLS; x++) {
        const cell = MAZE.MAP[y][x];
        if (cell === 'd') { this.dots.push({x, y, eaten: false}); }
        else if (cell === 'p') { this.powerPellets.push({x, y, eaten: false}); }
      }
    }
  }

  resetPositions() {
    this.pacman.reset();
    const positions = [[7,10],[7,12],[5,12],[9,12]];
    const colors = ['blinky','pinky','inky','clyde'];
    for (let i = 0; i < 4; i++) {
      this.ghosts[i].reset(positions[i][0], positions[i][1]);
      this.ghosts[i].setMode('scatter');
    }
    this.frightenedTimer = 0;
    this.ghostEatCombo = 0;
    this.resetMaze();
  }

  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.state = 'gameover';
      document.getElementById('message').textContent = 'GAME OVER — Press SPACE to restart';
    } else {
      this.state = 'dead';
      this.deathTimer = 90;
      document.getElementById('message').textContent = '';
    }
    this.updateHUD();
  }

  win() {
    this.state = 'win';
    document.getElementById('message').textContent = 'YOU WIN! — Press SPACE to restart';
  }

  updateHUD() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('high-score').textContent = this.highScore;
    let livesStr = '';
    for (let i = 0; i < this.lives; i++) livesStr += '🟡 ';
    document.getElementById('lives-display').textContent = livesStr;
  }

  update(dt) {
    if (this.state === 'gameover' || this.state === 'win') return;

    if (this.state === 'dead') {
      this.deathTimer--;
      if (this.deathTimer <= 0) {
        this.resetPositions();
        this.state = 'ready';
        this.readyTimer = 60;
      }
      return;
    }

    if (this.state === 'ready') {
      this.readyTimer--;
      if (this.readyTimer <= 0) this.state = 'playing';
      return;
    }

    // frightened timer
    if (this.frightenedTimer > 0) {
      this.frightenedTimer--;
      if (this.frightenedTimer <= 0) {
        this.ghosts.forEach(g => {
          if (g.mode === 'frightened') g.setMode('chase');
        });
        this.ghostEatCombo = 0;
      }
    }

    // pacman movement
    this.pacman.update(dt, this.input);

    // eat dots
    const pcx = Math.round(this.pacman.x / TILE.SIZE);
    const pcy = Math.round(this.pacman.y / TILE.SIZE);
    for (const d of this.dots) {
      if (!d.eaten && d.x === pcx && d.y === pcy) {
        // more precise: check proximity
        const dx = this.pacman.x - d.x * TILE.SIZE;
        const dy = this.pacman.y - d.y * TILE.SIZE;
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
          d.eaten = true;
          this.score += 10;
        }
      }
    }
    // eat power pellets
    for (const pp of this.powerPellets) {
      if (!pp.eaten) {
        const dx = this.pacman.x - pp.x * TILE.SIZE;
        const dy = this.pacman.y - pp.y * TILE.SIZE;
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
          pp.eaten = true;
          this.score += 50;
          this.frightenedTimer = this.frightenedDuration;
          this.ghostEatCombo = 0;
          this.ghosts.forEach(g => {
            if (g.mode !== 'eaten' && g.mode !== 'house') g.setMode('frightened');
          });
        }
      }
    }

    // check win
    let remaining = 0;
    for (const d of this.dots) if (!d.eaten) remaining++;
    for (const pp of this.powerPellets) if (!pp.eaten) remaining++;
    if (remaining === 0) { this.win(); return; }

    // ghost movement
    for (const g of this.ghosts) {
      g.update(dt, this.pacman, this);
      // collision with pacman
      const dx = this.pacman.x - g.x;
      const dy = this.pacman.y - g.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < TILE.SIZE * 0.7) {
        if (g.mode === 'frightened') {
          g.setMode('eaten');
          this.ghostEatCombo++;
          this.score += 200 * Math.pow(2, this.ghostEatCombo - 1);
        } else if (g.mode !== 'house' && g.mode !== 'eaten') {
          this.loseLife();
          return;
        }
      }
    }

    // teleport pacman
    if (this.pacman.x < -TILE.SIZE * 0.5) this.pacman.x = MAZE.COLS * TILE.SIZE + TILE.SIZE * 0.5;
    if (this.pacman.x > MAZE.COLS * TILE.SIZE + TILE.SIZE * 0.5) this.pacman.x = -TILE.SIZE * 0.5;

    this.updateHUD();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // walls
    ctx.strokeStyle = '#1a1aff';
    ctx.lineWidth = 2;
    for (let y = 0; y < MAZE.ROWS; y++) {
      for (let x = 0; x < MAZE.COLS; x++) {
        const cell = MAZE.MAP[y][x];
        if (cell === 'w') {
          const px = x * TILE.SIZE;
          const py = y * TILE.SIZE;
          // draw wall borders
          ctx.fillStyle = '#000';
          ctx.fillRect(px + 1, py + 1, TILE.SIZE - 2, TILE.SIZE - 2);
          // edges
          const top = y === 0 || MAZE.MAP[y-1][x] !== 'w';
          const bot = y >= MAZE.ROWS-1 || MAZE.MAP[y+1][x] !== 'w';
          const left = x === 0 || MAZE.MAP[y][x-1] !== 'w';
          const right = x >= MAZE.COLS-1 || MAZE.MAP[y][x+1] !== 'w';
          ctx.strokeStyle = '#1a1aff';
          ctx.lineWidth = 2;
          if (top) ctx.beginPath(); ctx.moveTo(px, py+1); ctx.lineTo(px+TILE.SIZE, py+1); ctx.stroke();
          if (bot) { ctx.beginPath(); ctx.moveTo(px, py+TILE.SIZE-1); ctx.lineTo(px+TILE.SIZE, py+TILE.SIZE-1); ctx.stroke(); }
          if (left) { ctx.beginPath(); ctx.moveTo(px+1, py); ctx.lineTo(px+1, py+TILE.SIZE); ctx.stroke(); }
          if (right) { ctx.beginPath(); ctx.moveTo(px+TILE.SIZE-1, py); ctx.lineTo(px+TILE.SIZE-1, py+TILE.SIZE); ctx.stroke(); }
        }
      }
    }

    // dots
    ctx.fillStyle = '#fff';
    for (const d of this.dots) {
      if (!d.eaten) {
        ctx.beginPath();
        ctx.arc(d.x * TILE.SIZE + 4, d.y * TILE.SIZE + 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // power pellets
    const pulse = Math.sin(Date.now() / 150) * 1.5 + 4;
    for (const pp of this.powerPellets) {
      if (!pp.eaten) {
        ctx.fillStyle = '#ffb8ae';
        ctx.beginPath();
        ctx.arc(pp.x * TILE.SIZE + 4, pp.y * TILE.SIZE + 4, pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // pacman
    if (this.state !== 'dead') {
      this.pacman.draw(ctx);
    }

    // ghosts
    for (const g of this.ghosts) {
      g.draw(ctx, this.frightenedTimer, this.ghostEatCombo);
    }
  }

  loop(time) {
    const dt = Math.min(time - this.lastTime, 33);
    this.lastTime = time;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

const canvas = document.getElementById('game');
globalThis.game = new Game(canvas);
