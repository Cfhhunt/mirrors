/*
  Mirrors
  Colin Hunt, 2022

  This p5.js sketch demonstrates the geometric reasoning behind mirros, showing how reflected images appear at an absolute distance equal to the total distance travelled by a ray of light.
  It does this by tracing the path of a "particle" object as it travels from an observer through a room of mirrors, potentially striking a "diamond" in the room.
  The absolute distance travelled to the diamond is deomonstrated via "ghost rays" that travel in a straight line from the point of reflection on the mirror.
*/

// Class that will make up the left and right mirrors
class Mirror {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw() {
    strokeWeight(4);
    stroke(0, 200, 255);
    line(this.x1, this.y1, this.x2, this.y2);
  }
}

// Class for the back wall
class Wall {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw() {
    strokeWeight(4);
    stroke(0, 0, 0);
    line(this.x1, this.y1, this.x2, this.y2);
  }
}

// The diamond that the viewer may strike with the line of sight
class Diamond {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // radius for collision detection
    this.r = 10;
    this.hit = false;
  }

  draw() {
    noStroke();
    fill(255, 0, 0);
    circle(this.x, this.y, this.r * 2);
  }
}

// A blue ball that represents the user/observer. This will be the point of origin for our rays
class Observer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    fill(0, 0, 255);
    circle(this.x, this.y, 20);
  }
}

// The user can move the sightBall to fire of line of sight rays
class SightBall {
  constructor(x, y) {
    this.x = x;
    // Offsetting it in y from the observer
    this.y = y - 20;
    this.angle = 90;
    this.size = 10;
    // The maximum range of motion in the x plane
    this.maxMovement = 75;
    this.selected = false;
    this.moved = false;
    // This variable helps with animating the sightBall so the user knows to interact with it
    this.animationSize = 0
  }

  draw() {
    noStroke()

    // This line increases the animated circle under the sightBall
    this.animationSize = (this.animationSize + .15) % 10
    fill(0, 200, 255);
    circle(this.x, this.y, this.size + this.animationSize);

    // drawing the circle for the sightBall
    fill(0, 150, 255);
    circle(this.x, this.y, this.size);
  }
}

// The Particle class is used to trace the trajectory of the line of sight as it travels and bounces off mirrors
class Particle {
  constructor(x, y, angle, ox, oy) {
    this.x = x;
    this.y = y;
    // Previous x, y coordinates - we'll use this for calculating intersections with the walls
    this.prevX = x;
    this.prevY = y;
    // Origin of particle, used for constructing rays and drawing lines
    this.originX = ox;
    this.originY = oy;
    this.angle = angle;
    this.speed = 3;
    this.moving = false
  }

  move() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = this.x + (this.speed * Math.cos(this.angle * Math.PI / 180));
    this.y = this.y + (this.speed * Math.sin(this.angle * Math.PI / 180));
  }

  // Reset puts the particle back at the observer
  reset(x, y, angle, ox, oy) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.originX = ox;
    this.originY = oy;
  }
}

// Class for the Rays that the particle leaves behind as it bounces off mirrors
class Ray {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw() {
    strokeWeight(2);
    stroke(255, 0, 0);
    line(this.x1, this.y1, this.x2, this.y2);
  }
}

// Ghost rays representing the mirror image of our rays
class GhostRay {
  constructor(x, y, angle) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x;
    this.y2 = y;
    this.angle = angle;
    this.speed = 3;
    this.moving = true;
    this.hit = false;
  }

  move() {
    this.x1 = this.x1 + (this.speed * Math.cos(this.angle * Math.PI / 180));
    this.y1 = this.y1 + (this.speed * Math.sin(this.angle * Math.PI / 180));
  }

  draw() {
    strokeWeight(2);
    stroke(255, 180, 180);
    line(this.x1, this.y1, this.x2, this.y2);

    if (this.hit == true) {
      noStroke();
      fill(255, 150, 150);
      circle(this.x1, this.y1, 20);
    }
  }
}

// Initializing objects
let leftMirror = new Mirror(350, 100, 350, 300);
let rightMirror = new Mirror(550, 100, 550, 300);
let wall = new Wall(350, 100, 550, 100);
let diamond = new Diamond(450, 150);
let observer = new Observer(450, 325);
let sightBall = new SightBall(observer.x, observer.y);
let particle = new Particle(sightBall.x, sightBall.y, 90, sightBall.x, sightBall.y);
const rays = [];
const ghostRays = [];

function setup() {
  createCanvas(1000, 600);
}

function draw() {
  background(235);

  // move particle and ghost rays
  if (particle.moving == true) {
    particle.move()
    ghostRays.forEach(gr => gr.move())
  }

  // collision detection against diamond
  let d = dist(particle.x, particle.y, diamond.x, diamond.y);
  if (d < diamond.r) {
    particle.moving = false;
    diamond.hit = true;
    ghostRays.forEach(gr => gr.hit = true)
  }

  // collision detection against left and right mirror. This is done by checking if the current movement (ie. from prevX to x) of the particle will intersect the line
  if ((IsIntersecting(particle.x, particle.y, particle.prevX, particle.prevY, leftMirror.x1, leftMirror.y1, leftMirror.x2, leftMirror.y2) ||
      IsIntersecting(particle.x, particle.y, particle.prevX, particle.prevY, rightMirror.x1, rightMirror.y1, rightMirror.x2, rightMirror.y2)) &&
    // This is a little hack that makes sure the particle doesn't immediately reflect again right after bouncing
    (Math.abs(particle.x - particle.originX) > 10)) {
      // If it has hit, turn particle path into a ray
    rays.push(new Ray(particle.originX, particle.originY, particle.x, particle.y));

    // Create a ghost ray
    ghostRays.push(new GhostRay(particle.x, particle.y, particle.angle));

    // update the particle's origin so it knows it starts at the mirror
    particle.originX = particle.x;
    particle.originY = particle.y;

    // flip the particle's angle
    particle.angle = 180 - particle.angle;
  }

  // collision detection against wall. If it hits, stop. This will also cause ghost rays to stop
  if (IsIntersecting(particle.x, particle.y, particle.prevX, particle.prevY, wall.x1, wall.y1, wall.x2, wall.y2)) {
    particle.moving = false
  }

  // Draw particle path if sightBall is not moving
  if (!sightBall.selected) {
    stroke(255, 0, 0)
    strokeWeight(2)
    line(particle.originX, particle.originY, particle.x, particle.y)
  }

  // draw rays
  rays.forEach(ray => ray.draw())

  // draw ghost rays
  ghostRays.forEach(gr => gr.draw())

  // draw solid objects
  leftMirror.draw();
  rightMirror.draw();
  diamond.draw();
  observer.draw();
  wall.draw();
  sightBall.draw();

}

// When the mouse is dragged, rays/ghost rays are erased and the particle is reset
function mouseDragged() {
  if (mouseX > observer.x - sightBall.maxMovement && mouseX < observer.x + sightBall.maxMovement) {
    sightBall.x = mouseX;
    sightBall.selected = true;
    sightBall.moved = true;
    rays.length = 0;
    ghostRays.length = 0;
  }
}

// When mouse is released, update the sightBall and reset the particle and diamond
function mouseReleased() {
  sightBall.selected = false;
  diamond.hit = false;

  if (sightBall.moved == true) {
    sightBall.moved = false;

    // reset Particle to its original position at the observer
    particle.reset(sightBall.x, sightBall.y, calcAngle(observer.x, observer.y, sightBall.x, sightBall.y), observer.x, observer.y);

    particle.moving = true;
  }
}

// Get the angle from observer to sightBall in degrees (radians might be better but I can only think in degrees)
// Source: https://stackoverflow.com/questions/53337799/how-to-get-angle-in-javascript-between-two-points
function calcAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  return theta;
}

// Tests for intersection between a ray and a mirror/wall
// Source: https://gamedev.stackexchange.com/questions/26004/how-to-detect-2d-line-on-line-collision
function IsIntersecting(ax, ay, bx, by, cx, cy, dx, dy) {
  let denominator = ((bx - ax) * (dy - cy)) - ((by - ay) * (dx - cx));
  let numerator1 = ((ay - cy) * (dx - cx)) - ((ax - cx) * (dy - cy));
  let numerator2 = ((ay - cy) * (bx - ax)) - ((ax - cx) * (by - ay));

  if (denominator == 0) return numerator1 == 0 && numerator2 == 0;

  let r = numerator1 / denominator;
  let s = numerator2 / denominator;

  return (r >= 0 && r <= 1) && (s >= 0 && s <= 1);
}
