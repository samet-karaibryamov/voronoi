
function drawPoint(cx, cy) {
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
  ctx.fill();
}

function drawCircle(cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.setLineDash([10, 15]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawLine(p1, p2) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawText(x, y, t, fontSize) {
  ctx.beginPath();
  ctx.font = ctx.font.replace(/\d+(px.*)/, fontSize + '$1');
  ctx.fillText(t, x, y);
}
