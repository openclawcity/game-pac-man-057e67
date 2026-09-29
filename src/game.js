// Pac-Man Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 16;
const COLS = 28;
const ROWS = 31;

// 0: empty, 1: wall, 2: dot, 3: power pellet, 4: ghost house
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let pacman = {x: 14, y: 23, dir: 'left', nextDir: 'left'};
let ghosts = [
    {x: 13, y: 14, color: '#f00', dir: 'up'},
    {x: 14, y: 14, color: '#ffb8ff', dir: 'up'},
    {x: 12, y: 14, color: '#00ffff', dir: 'left'},
    {x: 15, y: 14, color: '#ffb852', dir: 'right'}
];

let score = 0;
let dotsRemaining = 244;
let gameWon = false;
let gameOver = false;

function canMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return map[y][x] !== 1;
}

function movePacman() {
    let nx = pacman.x, ny = pacman.y;
    switch(pacman.nextDir) {
        case 'left': nx--; break;
        case 'right': nx++; break;
        case 'up': ny--; break;
        case 'down': ny++; break;
    }
    if (canMove(nx, ny)) {
        pacman.dir = pacman.nextDir;
        pacman.x = nx;
        pacman.y = ny;
    }
    
    switch(pacman.dir) {
        case 'left': pacman.x--; break;
        case 'right': pacman.x++; break;
        case 'up': pacman.y--; break;
        case 'down': pacman.y++; break;
    }
    
    // Wrap around
    if (pacman.x < 0) pacman.x = COLS - 1;
    if (pacman.x >= COLS) pacman.x = 0;
    
    // Eat dot
    if (canMove(pacman.x, pacman.y) && map[pacman.y][pacman.x] === 2) {
        map[pacman.y][pacman.x] = 0;
        score += 10;
        dotsRemaining--;
    }
    // Eat power pellet
    if (canMove(pacman.x, pacman.y) && map[pacman.y][pacman.x] === 3) {
        map[pacman.y][pacman.x] = 0;
        score += 50;
        dotsRemaining--;
    }
    
    if (dotsRemaining === 0) gameWon = true;
}

function moveGhost(ghost) {
    const dirs = ['up', 'left', 'down', 'right'];
    let possible = dirs.filter(d => {
        let gx = ghost.x, gy = ghost.y;
        switch(d) {
            case 'left': gx--; break;
            case 'right': gx++; break;
            case 'up': gy--; break;
            case 'down': gy++; break;
        }
        return canMove(gx, gy);
    });
    
    if (possible.length > 0) {
        ghost.dir = possible[Math.floor(Math.random() * possible.length)];
        let nx = ghost.x, ny = ghost.y;
        switch(ghost.dir) {
            case 'left': nx--; break;
            case 'right': nx++; break;
            case 'up': ny--; break;
            case 'down': ny++; break;
        }
        ghost.x = nx;
        ghost.y = ny;
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw map
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (map[y][x] === 1) {
                ctx.fillStyle = '#00f';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (map[y][x] === 2) {
                ctx.fillStyle = '#ffb8ae';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + 8, y * TILE_SIZE + 8, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (map[y][x] === 3) {
                ctx.fillStyle = '#ffb8ae';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + 8, y * TILE_SIZE + 8, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Draw Pacman
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(pacman.x * TILE_SIZE + 8, pacman.y * TILE_SIZE + 8, 7, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x * TILE_SIZE + 8, pacman.y * TILE_SIZE + 8);
    ctx.fill();
    
    // Draw ghosts
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x * TILE_SIZE + 8, ghost.y * TILE_SIZE + 6, 7, Math.PI, 0);
        ctx.lineTo(ghost.x * TILE_SIZE + 15, ghost.y * TILE_SIZE + 14);
        ctx.lineTo(ghost.x * TILE_SIZE + 11, ghost.y * TILE_SIZE + 10);
        ctx.lineTo(ghost.x * TILE_SIZE + 7, ghost.y * TILE_SIZE + 14);
        ctx.lineTo(ghost.x * TILE_SIZE + 3, ghost.y * TILE_SIZE + 10);
        ctx.fill();
    });
    
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Score: ' + score, 10, canvas.height - 10);
    
    if (gameWon) {
        ctx.fillStyle = '#ff0';
        ctx.font = '24px monospace';
        ctx.fillText('YOU WIN!', canvas.width/2 - 60, canvas.height/2);
    }
    if (gameOver) {
        ctx.fillStyle = '#f00';
        ctx.font = '24px monospace';
        ctx.fillText('GAME OVER', canvas.width/2 - 70, canvas.height/2);
    }
}

function gameLoop() {
    if (gameWon || gameOver) return;
    movePacman();
    ghosts.forEach(moveGhost);
    
    // Check ghost collision
    ghosts.forEach(ghost => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            gameOver = true;
        }
    });
    
    draw();
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft': pacman.nextDir = 'left'; break;
        case 'ArrowRight': pacman.nextDir = 'right'; break;
        case 'ArrowUp': pacman.nextDir = 'up'; break;
        case 'ArrowDown': pacman.nextDir = 'down'; break;
    }
});

setInterval(gameLoop, 200);
draw();
