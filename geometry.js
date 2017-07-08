function getMiddle(p1, p2) {
  return {
    x: 0.5 * (p1.x + p2.x),
    y: 0.5 * (p1.y + p2.y)
  };
}

function getVector(p1, p2) {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  };
}

function getDistance(p1, p2) {
  var dx =p1.x - p2.x;
  var dy =p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPBisector(a, b) {
  var abM = getMiddle(a, b);
  var abV = getVector(a, b);
  return {
    a: abM,
    b: {
      x: abM.x + abV.y,
      y: abM.y - abV.x
    }
  };
}

function getIntersection(l1, l2) {
  var d = { x: [], y: [] };
  ['x', 'y'].forEach(function(k) {
    [l1, l2].forEach(function (l) {
      d[k].push(l.a[k] - l.b[k]);
    });
  })
  var compound1 = l1.a.x * l1.b.y - l1.a.y * l1.b.x;
  var compound2 = l2.a.x * l2.b.y - l2.a.y * l2.b.x;
  var denom = d.x[0] * d.y[1] - d.y[0] * d.x[1];
  return {
    x: (compound1 * d.x[1] - d.x[0] * compound2) / denom,
    y: (compound1 * d.y[1] - d.y[0] * compound2) / denom,
  };
}

function getCircle(a, b, c) {
  var abPB = getPBisector(a, b);
  var bcPB = getPBisector(b, c);
  var c = getIntersection(abPB, bcPB);
  return {
    c: c,
    r: getDistance(c, a)
  }
}

function getAngle(origin, p) {
  return Math.atan2(p.y - origin.y, p.x - origin.x);
}

function isBetween(x, a, b) {
  return a <= x && x <= b;
}

function isPointBetween(p, pa, pb) {
  const x = [pa.x, pb.x].sort();
  const y = [pa.y, pb.y].sort();
  return isBetween(p.x, x[0], x[1]) && isBetween(p.y, y[0], y[1]);
}

function sameSide(line, p1, p2) {
  const { a, b } = line;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dd = [p1, p2].map(p => (p.y - a.y) * dx - (p.x - a.x) * dy);
  return dd[0] * dd[1] > 0;
}

function intersectBounds(edge, controlPt, bounds) {
  const { top, left, right, bottom } = bounds;
  const pbi = getPBisector(edge.a, edge.b);
  const v1 = getIntersection(pbi, { a: { x: 0, y: 0 }, b: { x: 0, y: 100 } });
  const v2 = getIntersection(pbi, { a: { x: right, y: 0 }, b: { x: right, y: 100 } });
  const h1 = getIntersection(pbi, { a: { x: 0, y: 0 }, b: { x: 100, y: 0 } });
  const h2 = getIntersection(pbi, { a: { x: 0, y: bottom }, b: { x: 100, y: bottom } });
  const a = [v1, v2]
    .filter(p => isBetween(p.y, top, bottom))
    .concat([h1, h2].filter(p => isBetween(p.x, left, right)));
  const b = a.filter(p => !sameSide(edge, controlPt, p));
  return b[0];
}
