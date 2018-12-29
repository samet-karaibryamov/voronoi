export const addPoints = (p1, p2) => ({ x: p1.x + p2.x, y: p1.y + p2.y });

export function getMiddle(p1, p2) {
  const points = p2 ? [p1, p2] : p1;
  return {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length
  };
}

export function getVector(a, b) {
  if (a.a) ({ a, b } = a);

  return {
    x: b.x - a.x,
    y: b.y - a.y
  };
}

export function scaleVector (v, k) {
  return {
    x: k * v.x,
    y: k * v.y
  };
}

export function getDistance(p1, p2) {
  var dx =p1.x - p2.x;
  var dy =p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getPBisector(a, b) {
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

export function getIntersection(l1, l2) {
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

export function getCircle(a, b, c) {
  var abPB = getPBisector(a, b);
  var bcPB = getPBisector(b, c);
  var c = getIntersection(abPB, bcPB);
  return {
    c: c,
    r: getDistance(c, a)
  }
}

export function getAngle(origin, p) {
  return Math.atan2(p.y - origin.y, p.x - origin.x);
}

export const getLineParams = ({ a, b }) => [a.y - b.y, a.x - b.x, a.x * b.y - a.y * b.x];

export function areCoHalfPlanar (line, pts, strict = false) {
  const [a, b, c] = line.a ? getLineParams(line) : line;

  const signs = {};
  pts.forEach(p => {
    const sign = Math.sign(a * p.x - b * p.y + c);
    signs[sign] = true;
  });
  // If all sign are the same
  if (Object.keys(signs).length === 1) return true;
  // If strictly on different half-planes
  if (signs[1] && signs[-1]) return false;
  // The remaining case is having a zero. This only depends on the flag
  return !strict;
};

export const isBetween = (x, a, b, strict = false) =>
  (a < x && x < b) || (a > x && x > b) || (!strict && (x === a || x === b));

export const isPointBetween = (p, a, b, strict = false) =>
  isBetween(p.x, a.x, b.x, strict) && isBetween(p.y, a.y, b.y, strict);
