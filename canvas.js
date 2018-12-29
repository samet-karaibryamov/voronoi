import {
  addPoints
} from './geometry.js';

export function drawCircle(cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.setLineDash([10, 15]);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawPoint(p, r) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
  ctx.fill();
}

export function drawLine(a, b) {
  if (!b) ({ a, b } = a);
  if (b.infinite) {
    b = addPoints(a, b);
  }

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

export function drawText(x, y, t, fontSize) {
  ctx.beginPath();
  ctx.font = ctx.font.replace(/\d+(px.*)/, fontSize + '$1');
  ctx.fillText(t, x, y);
}

window.drawLine = drawLine;
window.drawPoint = drawPoint;