var ctx = document.querySelector('canvas').getContext('2d');
var nodes = [];


var points = generatePoints(10);
points = [
  // { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 350, y: 200 },
  { x: 100, y: 300 },
  { x: 300, y: 350 },
  // { x: 200, y: 300 },
];
points.forEach(function(p, i) {
  p.triangles = [];
  p.links = [];
  p.idx = i;
});
points.forEach(function(p, i) {
  drawPoint(p.x, p.y);
  drawText(p.x + 5, p.y - 5, i, 20);
});

var triangles = getDelauneyTriangles(points);
var links = getLinks(triangles);
var trivialLinks = false;
if (!Object.keys(links).length) {
  links = getTrivialLinks(points);
  trivialLinks = true;
}
Object.keys(links).forEach(function(k) {
  const link = links[k].i;
  drawLine(points[link[0]], points[link[1]]);
});

attachLinksToPoints(points, links);
triangles.forEach(function(tri) {
  var c = tri.circle.c;
  drawCircle(c.x, c.y, tri.circle.r);
});

const polygons = getPolygons(points, trivialLinks);

polygons.forEach(pol => {
  if (!pol) return;
  switch (pol.type) {
    case 'half':
      drawLine(pol.line.a, pol.line.b);
      break;
    case 'band':
      drawLine(pol.line1.a, pol.line1.b);
      drawLine(pol.line2.a, pol.line2.b);
      break;
    case 'regular':
      pol.lines.forEach(l => {
        drawLine(l.a, l.b);
      });
      break;
    default:
  }
});
