const keys = new Set();

window.addEventListener('keydown', e => {
  keys.add(e.code);
  // prevent arrow keys / space scrolling the page
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
});
window.addEventListener('keyup', e => keys.delete(e.code));

export function isDown(code) { return keys.has(code); }

export function isLeft()  { return keys.has('ArrowLeft')  || keys.has('KeyA'); }
export function isRight() { return keys.has('ArrowRight') || keys.has('KeyD'); }
export function isJump()  { return keys.has('ArrowUp')    || keys.has('KeyW') || keys.has('Space'); }
