import {
  getCircle,
  getAngle,
  getPBisector,
  getIntersection,
  areCoHalfPlanar,
  isBetween,
  isPointBetween,
  getLineParams,
  getVector,
  getMiddle,
  addPoints,
  scaleVector,
  getDistance
} from './geometry.js';
import {
  exractOrderedTriplets,
  forEachInPairs
} from './utils.js';

export function getDelauneyTriangles(points) {
  var triangles = [];
  var register = {};
  var plen = points.length;
  for(var i = 0; i < plen - 2; i++) {
    var pa = points[i];
    for(var j = i + 1; j < plen - 1; j++) {
      var pb = points[j];
      loop:
      for(var k = j + 1; k < plen; k++) {
        if (register[[i, j, k].join('|')]) continue;
        var pc = points[k];
        var circle = getCircle(pa, pb, pc);
        // Colinearity detection
        if (!isFinite(circle.r)) continue;
        var indices = [i, j, k];
        for(var l = 0; l < plen; l++) {
          if ([i, j, k].indexOf(l) > -1) continue;
          var pd = points[l];
          var dist = getDistance(pd, circle.c);
          if (dist < circle.r) continue loop;
          if (dist === circle.r) indices.push(l);
        }
        indices.sort(function(i1, i2) {
          return getAngle(circle.c, points[i1]) - getAngle(circle.c, points[i2]);
        });
        var face = {
          indices: indices,
          circle: circle
        };
        triangles.push(face);
        indices.forEach(function(idx) {
          points[idx].triangles.push(face);
        });
        
        exractOrderedTriplets(indices.slice()).forEach(function (trp) {
          register[trp] = face;
        });
      }
    }
  }
  return triangles;
}

function registerLink(register, idx1, idx2) {
  var keys = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
  var key = keys.join('|');
  if (!register[key]) register[key] = { n: 0, i: keys };
  register[key].n++;
}

export function getLinks(triangles) {
  var register = {};
  triangles.forEach(function(tri) {
    forEachInPairs(tri.indices, function(idx1, idx2) {
      registerLink(register, idx1, idx2);
    });
  });
  return register;
}

export function attachLinksToPoints(points, links) {
  Object.keys(links).forEach(function (k) {
    const link = links[k];
    points[link.i[0]].links.push(link);
    points[link.i[1]].links.push(link);
  });
  points.forEach((p, pi) => {
    // Order them circularly
    p.links.sort((l1, l2) => {
      var ps = [l1, l2].map(l => {
        return points[
          l.i[0] === pi ? l.i[1] : l.i[0]
        ];
      });
      return getAngle(p, ps[0]) - getAngle(p, ps[1]);
    });
  });
}

function getPolygon(center, points, trivialLinks) {
  const links = center.links;
  const llen = links.length;
  if (!llen) return { type: 'full' };
  if (llen === 1)
    return {
      type: 'half',
      line: getPBisector(points[links[0].i[0]], points[links[0].i[1]]),
      center,
    };
  if (trivialLinks)
    return {
      type: 'band',
      line1: getPBisector(points[links[0].i[0]], points[links[0].i[1]]),
      line2: getPBisector(points[links[1].i[0]], points[links[1].i[1]]),
      center,
    };

  const poly = {
    type: 'regular',
    lines: [],
    vertices: [],
    center,
  };
  poly.lines = links.map(l => {
    return getPBisector(points[l.i[0]], points[l.i[1]]);
  });
  // Edge point
  if (links.length === 2) {
    const l0 = poly.lines[0];
    const l1 = poly.lines[1];
    poly.vertices.push(
      getIntersection(l0, l1),
      l0,
      l1,
    );
  } else {
    links.forEach((l1, i) => {
      const j = (i + 1) % links.length;
      const l2 = links[j];
      if (l1.n > 1 || l2.n > 1) {
        poly.vertices.push(
          getIntersection(poly.lines[i], poly.lines[j])
        );
      } else {
        poly.vertices.push(
          poly.lines[i], poly.lines[j]
        );
      }
    });
  }
  // Post-process for infinite points
  poly.vertices.some((l0, i, arr) => {
    const l1 = arr[(i + 1) % arr.length];
    if (!l0.a || !l1.a) return;

    const prev = arr[(i - 1 + arr.length) % arr.length];
    const next = arr[(i + 2) % arr.length];
    let v0 = getVector(l0.a, l0.b);
    let v1 = getVector(l1.a, l1.b);
    if (!areCoHalfPlanar(l1, [center, addPoints(prev, v0)])) {
      v0 = scaleVector(v0, -1);
    }
    if (!areCoHalfPlanar(l0, [center, addPoints(next, v1)])) {
      v1 = scaleVector(v1, -1);
    }
    v0.infinite = true;
    v1.infinite = true;

    // Mutation ahead!!!
    l0.a = prev;
    l0.b = v0;
    l1.a = next;
    l1.b = v1;
    arr[i] = v0;
    arr[(i + 1) % arr.length] = v0;

    // Early exit for slight optimization
    return true;
  });

  return poly;
}

export function getPolygons(points, trivialLinks) {
  return points.map(pt => getPolygon(pt, points, trivialLinks));
}

function intersectWithViewport (p1, p2, viewport, strict = true) {
  if (p1.infinite && p2.infinite) return;

  const isInf = p1.infinite || p2.infinite;
  let [a, b] = [p1, p2];
  if (isInf) {
    [a, b] = p1.infinite ? [p2, p1] : [p1, p2];
    b = addPoints(a, b);
  }
  let l = { a, b };
  if (areCoHalfPlanar(l, viewport.corners)) return;

  const pts0 = viewport.walls.map(w => getIntersection(l, w));
  // Mutation ahead!!!
  const pts1 = pts0.filter((p, i) => {
    const w = viewport.walls[i];
    // Fix for intersection inaccuracies (e.g. 400.00000006 instead of 400)
    if (w.a.x === w.b.x) p.x = w.a.x
    else p.y = w.a.y;

    return (
      // Check for parallelism
      isFinite(p.x) && isFinite(p.y) &&
      // Check for intersection out of bounds
      isPointBetween(p, viewport.topLeft, viewport.bottomRight) &&
      // Check for out of segments
      (!strict || isInf || isPointBetween(p, p1, p2)) &&
      // Check for out of rays
      (!strict || !isInf || !isPointBetween(a, b, p))
    );
  });
  return pts1;
};

const filterByContour = (contour, points, center) => {
  const lines = contour
    .map(line => {
      let { a, b } = line;
      if (a.infinite || b.infinite) {
        const aa = a.infinite ? b : a;
        b = addPoints(a, b);
        a = aa;
      }
      return getLineParams({ a, b });
    });
  return points.filter(p => {
    return lines.every(line => areCoHalfPlanar(line, [center, p]));
  })
};

const orderByAngle = (points) => {
  const midPoint = getMiddle(points);
  return points.sort((a, b) => {
    const va = getVector(midPoint, a);
    const vb = getVector(midPoint, b);
    const ta = Math.atan2(va.y, va.x);
    const tb = Math.atan2(vb.y, vb.x);
    return ta - tb;
  })
};

export function intersectPolygonWithViewport ({ lines, vertices, center }, viewport) {
  const viewportIntersections = [];
  const strictViewportIntersection = !!vertices.length;
  lines.forEach(({ a, b }) => {
    viewportIntersections.push(...intersectWithViewport(a, b, viewport, strictViewportIntersection));
  });
  const clipCorners = filterByContour(lines, viewport.corners, center);
  const clippedPoints = vertices.filter(p =>
    !p.infinite &&
    isPointBetween(p, viewport.topLeft, viewport.bottomRight)
  );
  const contour = orderByAngle(viewportIntersections.concat(clipCorners, clippedPoints));
  return contour;
}