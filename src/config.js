// Pac-Man game configuration
const CONFIG = (() => {
  const COLS = 25;
  const ROWS = 31;
  let scale = Math.min(Math.floor((window.innerWidth - 20) / COLS), Math.floor((window.innerHeight - 80) / ROWS), 22);
  scale = Math.max(scale, 14);
  return {
    COLS,
    ROWS,
    CELL: scale,
    WALL_COLOR: '#2244aa',
    DOT_COLOR: '#ffb8ae',
    POWER_DOT_COLOR: '#fff',
    PACMAN_COLOR: '#ffff00',
    SPEED: 3, // pixels per frame for Pac-Man
    GHOST_SPEED: 2,
    FRIGHTENED_COLOR: '#2222ff',
    EYES_COLOR: '#fff',
    LIVES: 3,
    TOTAL_DOTS: COLS * ROWS * 0.35, // approximate
    LEVEL_TIME: 180 // seconds before speed increase
  };
})();

function recalcScale() {
  let scale = Math.min(Math.floor((window.innerWidth - 20) / CONFIG.COLS), Math.floor((window.innerHeight - 80) / CONFIG.ROWS), 22);
  scale = Math.max(scale, 14);
  CONFIG._CELL = scale;
}

CONFIG._getCell = function() { return CONFIG._CELL || CONFIG.CELL; };
CONFIG.setCell = function(s) { CONFIG._CELL = s; };

window.addEventListener('resize', recalcScale);
recalcScale();
CONFIG.setCell(CONFIG.CELL);
