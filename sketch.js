// Variables
let x = 200;
let y = 200;
let score = 0;

// setup() runs ONCE when the game starts
function setup() {
  createCanvas(400, 400);
}

// draw() runs about 60 times every second. This is your game loop.
function draw() {
  background(30); // clear the screen

  // Read input
  if (keyIsDown(LEFT_ARROW)) x -= 4;
  if (keyIsDown(RIGHT_ARROW)) x += 4;
  if (keyIsDown(UP_ARROW)) y -= 4;
  if (keyIsDown(DOWN_ARROW)) y += 4;

  // Draw everything 
  fill(80, 200, 255);
  circle(x, y, 40);

  fill(255);
  text("Score: " + score, 10, 20);
}
