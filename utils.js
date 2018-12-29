
export function generatePoints(n, viewport) {
  var points = [];
  for(var i = 0; i < n; i++) {
    points.push({
      x: Math.round(Math.random() * viewport.width),
      y: Math.round(Math.random() * viewport.height)
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
