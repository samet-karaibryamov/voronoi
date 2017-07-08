
function createCirularComparator(center) {
  return function(p1, p2) {
    return getAngle(center, p1) - getAngle(center, p2);
  };
}

function getDelauneyTriangles(points) {
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

function getLinks(triangles) {
  var register = {};
  triangles.forEach(function(tri) {
    forEachInPairs(tri.indices, function(idx1, idx2) {
      registerLink(register, idx1, idx2);
    });
  });
  return register;
}

function getTrivialLinks(points) {
  const register = {};
  for (var i = 0; i < points.length - 1; i++) {
    const pi = points[i];
    loop:
    for (var j = i + 1; j < points.length; j++) {
      const pj = points[j];
      for (var k = 0; k < points.length; k++) {
        if (k === i || k === j) continue;
        const pk = points[k];
        if (isPointBetween(pk, pi, pj)) continue loop;
      }
      registerLink(register, i, j);
    }
  }
  return register;
}

function attachLinksToPoints(points, links) {
  Object.keys(links).forEach(function (k) {
    const link = links[k];
    points[link.i[0]].links.push(link);
    points[link.i[1]].links.push(link);
  });
}

function getItemNeighbours(item, array) {
  var idx = array.indexOf(item);
  return {
    prev: array[(idx - 1 + array.length) % array.length],
    next: array[(idx + 1 + array.length) % array.length]
  };
}

function boundaryVertices(point, ends, bounds) {
  const bs = [ends.prev, ends.next].map(
    end => intersectBounds(
      {
        a: point,
        b: end.pt,
      },
      end.controlPt,
      bounds,
    )
  );
  console.log(bs);
}

function markPolygons(points, bounds) {
  points.forEach((p, idx) => {
    console.log(idx);
    const phash = {};
    p.triangles.forEach(tri => {
      const nb = getItemNeighbours(idx, tri.indices);
      [nb.prev, nb.next].forEach(i => {
        const t = phash[i] = phash[i] || { idx: i, n: 0 };
        t.n++;
        t.triangle = tri;
      });
    });
    const ends = Object.keys(phash).filter(k => phash[k].n === 1).map(k => phash[k]);
    boundaryVertices(
      points[idx],
      {
        prev: {
          pt: points[ends[0].idx],
          controlPt: points[ends[1].idx],
        },
        next: {
          pt: points[ends[1].idx],
          controlPt: points[ends[0].idx],
        }
      },
      bounds,
    );
  });
}

function getPolygon(pt, points, trivialLinks) {
  const links = pt.links;
  const llen = links.length;
  if (!llen) return { type: 'full' };
  if (llen === 1)
    return {
      type: 'half',
      line: getPBisector(points[links[0].i[0]], points[links[0].i[1]]),
      controlPt: pt,
    };
  if (trivialLinks)
    return {
      type: 'band',
      line1: getPBisector(points[links[0].i[0]], points[links[0].i[1]]),
      line2: getPBisector(points[links[1].i[0]], points[links[1].i[1]]),
    };

  const poly = {
    type: 'regular',
    lines: [],
    vertices: [],
  };
  poly.lines = links.map(l => {
    return getPBisector(points[l.i[0]], points[l.i[1]]);
  });
  poly.vertices = 
  return poly;
}

function getPolygons(points, trivialLinks) {
  return points.map(pt => getPolygon(pt, points, trivialLinks));
}
