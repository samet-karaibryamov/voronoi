import {
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
  getPolygons,
  intersectPolygonWithViewport
} from './algo.js';
import { values as colors } from '/colors.js';

var canvas = document.querySelector('canvas');
var ctx = window.ctx = canvas.getContext('2d');
ctx.translate(50, 50);
ctx.clearRect(-50, -50, 500, 500);
window.viewport = (() => {
  const width = 400;
  const height = 400;
  const topLeft = { x: 0, y: 0 };
  const bottomRight = { x: width, y: height };
  const corners = [
    topLeft,
    { x: width, y: 0 },
    bottomRight,
    { x: 0, y: height },
  ];
  const walls = corners.map((c, i) => {
    const c1 = corners[(i + 1) % 4];
    return { a: c, b: c1 };
  });
  return {
    x: 0,
    y: 0,
    walls,
    corners,
    topLeft,
    bottomRight,
    width,
    height
  };
})();
ctx.strokeStyle = 'black';
ctx.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height);


var points = generatePoints(9, viewport);
// points = [
//   { x: 100, y: 100 },
//   { x: 200, y: 100 },
//   { x: 350, y: 250 },
//   { x: 100, y: 300 },
//   { x: 300, y: 350 },
//   { x: 200, y: 200 },
// ];

function generateAndDraw() {
  points.forEach(function(p, i) {
    p.triangles = [];
    p.links = [];
    p.idx = i;
  });
  points.forEach(function(p, i) {
    drawPoint(p);
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

  window.contours = polygons.map(poly => intersectPolygonWithViewport(poly, viewport));
  polygons.forEach(({ center }) => {
    drawPoint(center, 5);
  });

  contours.forEach((contour, j) => {
    ctx.beginPath();
    contour.forEach((p, i) => {
      if (i) {
        ctx.lineTo(p.x, p.y);
      } else {
        ctx.moveTo(p.x, p.y);
      }
    });
    ctx.fillStyle = colors[j + 5] + '80';
    ctx.fill();
  });

}

generateAndDraw();
