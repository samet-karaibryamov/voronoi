
export function generatePoints(n) {
  var points = [];
  for(var i = 0; i < n; i++) {
    points.push({
      x: Math.round(Math.random() * 600),
      y: Math.round(Math.random() * 600)
    });
  }
  return points;
}

export function exractOrderedTriplets(indices) {
  var len = indices.length;
  var triplets = [];
  indices.sort(function(a, b) { return a - b; });
  for(var i = 0; i < len - 2; i++) {
    for(var j = i + 1; j < len - 1; j++) {
      for(var k = j + 1; k < len; k++) {
        triplets.push([indices[i], indices[j], indices[k]].join('|'));
      }
    }
  }
  return triplets;
}

export function forEachInPairs(array, cb) {
  array.forEach(function(item1, i) {
    var item2 = array[(i + 1) % array.length];
    cb(item1, item2);
  });
}

export function initBounds(bounds) {
  var tl = { x: bounds.left, y: bounds.top };
  var tr = { x: bounds.right, y: bounds.top };
  var bl = { x: bounds.left, y: bounds.bottom };
  var br = { x: bounds.right, y: bounds.bottom };
  var leftl = { a: tl, b: bl };
  var rightl = { a: tr, b: br };
  var topl = { a: tl, b:tr };
  var bottoml = { a: bl, b:br };
  return Object.assign(
    {      
      x: bounds.left,
      y: bounds.top,
      w: bounds.right - bounds.left + 1,
      h: bounds.bottom - bounds.top + 1,
      lines: {
        l: leftl,
        r: rightl,
        t: topl,
        b: bottoml,
      },
      points: { tl, tr, bl, br }
    },
    bounds
  );
}
