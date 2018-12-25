import {
  initBounds,
  generatePoints
} from './utils.js';
import {
  drawPoint,
  drawText,
  drawLine,
  drawCircle
} from './canvas.js';
import {
  getDelauneyTriangles,
  getLinks,
  attachLinksToPoints,
  getPolygons
} from './algo.js';
import {
  intersectAbstractPolygon
} from './geometry.js';

var canvas = document.querySelector('canvas');
var ctx = window.ctx = canvas.getContext('2d');
ctx.translate(50, 50);
var bounds = initBounds({
  left: 0,
  top: 0,
  right: canvas.width - 1 - 100,
  bottom: canvas.height - 1 - 100
});
ctx.strokeStyle = 'black';
ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
var nodes = [];


var points = generatePoints(10);
points = [
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 350, y: 250 },
  // { x: 100, y: 300 },
  // { x: 300, y: 350 },
  // { x: 200, y: 300 },
];

function generateAndDraw() {
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
  window.links = getLinks(triangles);
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

  window.polygons = getPolygons(points, trivialLinks);

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
          // drawLine(l.a, l.b);
        });
        // return;
        pol.vertices.forEach(v => {
          if (!('x' in v)) return;
          drawPoint(v.x, v.y, 2);
        });
        break;
      default:
    }
  });
  
  polygons.forEach(pol => {
    if (pol.type === 'regular') {
      intersectAbstractPolygon(pol, bounds);
    }
  });
}

generateAndDraw();
