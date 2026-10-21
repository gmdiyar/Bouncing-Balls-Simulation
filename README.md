# Bouncing balls physics simulation.

## Overarching questions: how does a computer know where a simulated object should be?

A physics simulation never actually implements physics equations because of their discrete nature (can't process infinity.)
So what we end up having to do is to predict the position of an object for each time step (usually 60 times per second.)

## Go to https://editor.p5js.org/

Let's have a look at the boilerplate JS code that's given in the online p5 edition:
```
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
```

the setup() function executes once at the start of the program, its the set-up code. In this case it's creating a 400 by 400 pixel canvas, which the window that we can actually render on.

the draw() loop is the game loop that runs about 60 times per second. Almost everything happens in this loop and it's where we'll be mostly working. try changing the background value (220) and see what happens.

try running this code and moving your cursor around the canvas:
```
function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30);
  fill(255, 120, 80);
  noStroke();
  circle(mouseX, mouseY, 40);
}
```

You should see a ball follow your cursor.

Now try remove `background(30);` and move your cursor around the canvas again.

As you can see, not clearing the background each time leaves the residual frames behind.

Now let's implement out first falling ball:

```
let y = 50; // starting verticle position
let vy = 0; // starting verticle velocity
const gravity = 0.5;  

function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30);

  vy += gravity; // add the gravity constant to the velocity
  y += vy; // add the velocity to the position

  // naive floor bounce
  if (y > height - 20) { // if the y position is greater than (past) the height of the canvas - 20 (radius)
    y = height - 20; // position should now be right at the edge of the floor
    vy *= -0.8; // dampening and reverse velocity
  }

  circle(width / 2, y, 40); // draw circle
}
```

Try changing the gravity constant to see what happens.

This is Euler integration, and while useful for its simplicity, it gets messy quick and it's not ideal for optimization/performance.

The more advanced algorithm we'll be implementing the Verlet integration:

Verlet itegration stores two variables: where the object is and where it was last. The velocity then is just the difference between these two positions. I.E, the distance. The larger the distance between the two positions, the greater the velocity will be. 

**x<sub>new</sub> = x + (x − x<sub>prev</sub>) + a · Δt<sup>2</sup>**

where:

- **x<sub>new</sub>** is the position after this step
- **x** is the current position
- **x<sub>prev</sub>** is the position from the previous step
- **x − x<sub>prev</sub>** is the implied velocity (how far the object moved last step)
- **a** is the acceleration (e.g. gravity)
- **Δt** is the time step (e.g. 1/60 of a second)

Implementing this formula:

# Ball class

Create a ball class to make later

```
class Ball {
```

## Constructor

Runs once when the ball class is instantiated (made into an object)

x = x position

y = y position

r = radius

```
  constructor(x, y, r) {
```

We create a vector (a pair of numbers stored as one variable) for:

1. current position
2. previous position (we start it in the same position it was last which makes it still)
3. acceleration (how much force is being applied to the ball from the left and right [x,y]. we also start this at 0)

```
    this.pos = createVector(x, y);
    this.prev = createVector(x, y);
    this.acc = createVector(0, 0);
    this.r = r;
  }
```

## Accelerate

This method is called within the ball class to add the acceleration to the ball.

```
  accelerate(a) {
    this.acc.add(a);
  }
```

## Update

Called to update the position of the ball by moving one forward one step of size delta time (dt)

```
  update(dt) {
```

This operation comes directly from the Verlet formula

```
    const vel = p5.Vector.sub(this.pos, this.prev);
```

Stores the current position as the previous position so we can use it for the next step.

```
    this.prev = this.pos.copy();
```

Move the ball:

1. keep going the same way it was going (add vel)
2. add the push from acceleration (acc * dt * dt)

```
    this.pos.add(vel).add(p5.Vector.mult(this.acc, dt * dt));
```

Reset the acceleration so it can be calculated in the next step (pos - prev_pos)

Try commenting this out to see how the ball bahaves if we don't clear the acceleration

```
    this.acc.set(0, 0);
  }
```

## Show

Method to draw the circle, we give it the x and y position as well as radius * 2 (diameter)

```
  show() {
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}
```

# Sketch

Instantiate the ball variable so we can work this it later

```
let ball;
```

Store our gravity constant, play around with this

```
const GRAVITY = 1000;
```

## Setup

```
function setup() {
  createCanvas(600, 400);
```

Create a ball at x = 300, y = 50, and radius = 20

```
  ball = new Ball(300, 50, 20);
}
```

## Draw

```
function draw() {
```

Clear the background

```
  background(30);
```

Our delta time, which is how fast time is moving. 60 fps is one frame per second which means each frame lasts 1/60th of a second.

```
  const dt = 1 / 60;
```

Accelerate the ball with a velocity of 0 sideways (x) and GRAVITY verically (y)

```
  ball.accelerate(createVector(0, GRAVITY));
```

Move the ball one step

```
  ball.update(dt);
```

Draw the ball

```
  ball.show();
}
```

# Full code:

```
class Ball {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.prev = createVector(x, y);
    this.acc = createVector(0, 0);
    this.r = r;
  }

  accelerate(a) {
    this.acc.add(a);
  }

  update(dt) {
    const vel = p5.Vector.sub(this.pos, this.prev);
    this.prev = this.pos.copy();
    this.pos.add(vel).add(p5.Vector.mult(this.acc, dt * dt));
    this.acc.set(0, 0);
  }

  show() {
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}

let ball;
const GRAVITY = 1000;

function setup() {
  createCanvas(600, 400);
  ball = new Ball(300, 50, 20);
}

function draw() {
  background(30);
  const dt = 1 / 60;
  ball.accelerate(createVector(0, GRAVITY));
  ball.update(dt);
  ball.show();
}
```

# Collisions

Try adding this method to the ball class:
```
  constrainToBox() {
    this.pos.x = constrain(this.pos.x, this.r, width - this.r);
    this.pos.y = constrain(this.pos.y, this.r, height - this.r);
  }
```

Now call this method right after we call `ball.update(dt);`

The ball should now stop completely once it touche the floor. This happens because the position was changed with the `constrainToBox` method, but the previous position was never changed.

# Bouncing and dampening

update the `constrainToBox` method to:
```
    constrainToBox() {
    const vel = p5.Vector.sub(this.pos, this.prev);

    if (this.pos.y > height - this.r) {          // floor
      this.pos.y = height - this.r;
      this.prev.y = this.pos.y + vel.y * BOUNCE;
    }
    if (this.pos.y < this.r) {                   // ceiling
      this.pos.y = this.r;
      this.prev.y = this.pos.y + vel.y * BOUNCE;
    }
    if (this.pos.x > width - this.r) {           // right wall
      this.pos.x = width - this.r;
      this.prev.x = this.pos.x + vel.x * BOUNCE;
    }
    if (this.pos.x < this.r) {                   // left wall
      this.pos.x = this.r;
      this.prev.x = this.pos.x + vel.x * BOUNCE;
    }
  }
```
And add the BOUNCE constant along with GRAVITY
```
const BOUNCE = 0.8
```

Now the ball should bounce and lose 20% of its velocity with each bounce.
20% because we multiply the velocity by 0.8 which means it keeps 80%.

Try changing `  ball.accelerate(createVector(0, GRAVITY));` to `  ball.accelerate(createVector(500, GRAVITY));` to add some wind.

# Multiple balls

Right now we only have one ball. To have more, we need a list (an array) that holds every ball.

Add this under `let ball;`
```
let balls = [];
```

## Setup

In `setup()`, add our starting ball to the list right after we create it

```
  balls.push(ball);
```

## mousePressed

p5 runs `mousePressed()` once every time you click on the canvas. Each click makes a new ball where the mouse is, with a radius of 20, and adds it to the list

```
function mousePressed() {
  balls.push(new Ball(mouseX, mouseY, 20));
}
```

## Draw

Now update `draw()` so it does everything to every ball instead of just one.

`for (const b of balls)` runs the code inside it once for each ball in the list, calling the current ball `b`

First, accelerate and move every ball

```
function draw() {
  background(30);
  const dt = 1 / 60;
  for (const b of balls) {
    b.accelerate(createVector(0, GRAVITY));
    b.update(dt);
  }
```

Then keep every ball in the box and draw it

```
  for (const b of balls) {
    b.constrainToBox();
    b.show();
  }
}
```

## Your code should now look like this:
```
class Ball {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.prev = createVector(x, y);
    this.acc = createVector(0, 0);
    this.r = r;
  }

  accelerate(a) {
    this.acc.add(a);
  }

  update(dt) {
    const vel = p5.Vector.sub(this.pos, this.prev);
    this.prev = this.pos.copy();
    this.pos.add(vel).add(p5.Vector.mult(this.acc, dt * dt));
    this.acc.set(0, 0);
  }

  constrainToBox() {
    const vel = p5.Vector.sub(this.pos, this.prev);

    if (this.pos.y > height - this.r) {
      this.pos.y = height - this.r;
      this.prev.y = this.pos.y + vel.y * BOUNCE;
    }
    if (this.pos.y < this.r) {
      this.pos.y = this.r;
      this.prev.y = this.pos.y + vel.y * BOUNCE;
    }
    if (this.pos.x > width - this.r) {
      this.pos.x = width - this.r;
      this.prev.x = this.pos.x + vel.x * BOUNCE;
    }
    if (this.pos.x < this.r) {
      this.pos.x = this.r;
      this.prev.x = this.pos.x + vel.x * BOUNCE;
    }
  }

  show() {
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}

let ball;
let balls = [];
const GRAVITY = 1000;
const BOUNCE = 0.8;

function setup() {
  createCanvas(600, 400);
  ball = new Ball(300, 50, 20);
  balls.push(ball);
}

function mousePressed() {
  balls.push(new Ball(mouseX, mouseY, 20));
}

function draw() {
  background(30);
  const dt = 1 / 60;
  for (const b of balls) {
    b.accelerate(createVector(0, GRAVITY));
    b.update(dt);
  }
  for (const b of balls) {
    b.constrainToBox();
    b.show();
  }
}
```

Click around the canvas to add some balls. They bounce off the walls, but they pass right through each other. That's what we'll fix next.

# Ball to ball collisions

Two balls are touching when the distance between their centers is less than their two radii added together. If they overlap, we push each ball away from the other by half the overlap.

Just like with `constrainToBox`, we only move the positions and leave the previous positions alone. Because velocity is pos - prev, pushing the balls apart changes their velocity on its own, so the balls bounce off each other without any extra code.

Add this function under `mousePressed()`

```
function solveCollisions() {
```

Go through every pair of balls. `j` starts at `i + 1` so each pair only gets checked once, and a ball never gets checked against itself

```
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
```

Get the vector pointing from ball b to ball a, and its length, which is the distance between their centers

```
      const axis = p5.Vector.sub(a.pos, b.pos);
      const dist = axis.mag();
```

The closest the two centers can be without overlapping is the two radii added together

```
      const minDist = a.r + b.r;
```

If they are closer than that, they overlap. We also check `dist > 0` so we never divide by 0 if two balls are in the exact same spot

```
      if (dist < minDist && dist > 0) {
```

Turn the axis into a direction with a length of 1 by dividing it by its length, then work out half of the overlap

```
        const n = axis.div(dist);
        const push = (minDist - dist) / 2;
```

Push ball a forward along the direction and ball b backward, by half the overlap each

```
        a.pos.add(p5.Vector.mult(n, push));
        b.pos.sub(p5.Vector.mult(n, push));
      }
    }
  }
}
```

Now call `solveCollisions();` in `draw()`, between the loop that moves the balls and the loop that draws them

```
  solveCollisions();
```

Click in some balls again. They should now bounce off each other and pile up on the floor.

Try clicking in a lot of balls. The bottom of the pile gets squishy and jittery, because pushing two balls apart can push one of them into a third ball.

# Full code:

```
class Ball {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.prev = createVector(x, y);
    this.acc = createVector(0, 0);
    this.r = r;
  }

  accelerate(a) {
    this.acc.add(a);
  }

  update(dt) {
    const vel = p5.Vector.sub(this.pos, this.prev);
    this.prev = this.pos.copy();
    this.pos.add(vel).add(p5.Vector.mult(this.acc, dt * dt));
    this.acc.set(0, 0);
  }
 
    constrainToBox() {
    const vel = p5.Vector.sub(this.pos, this.prev);

    if (this.pos.y > height - this.r) {
      this.pos.y = height - this.r;
      this.prev.y = this.pos.y + vel.y * BOUNCE;
    }
    if (this.pos.y < this.r) {
      this.pos.y = this.r;
      this.prev.y = this.pos.y + vel.y * BOUNCE;
    }
    if (this.pos.x > width - this.r) {
      this.pos.x = width - this.r;
      this.prev.x = this.pos.x + vel.x * BOUNCE;
    }
    if (this.pos.x < this.r) {
      this.pos.x = this.r;
      this.prev.x = this.pos.x + vel.x * BOUNCE;
    }
  }
  
  show() {
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}

let ball;
let balls = [];
const GRAVITY = 1000;
const BOUNCE = 0.8;

function setup() {
  createCanvas(600, 400);
  ball = new Ball(300, 50, 20);
  balls.push(ball);
}

function mousePressed() {
  balls.push(new Ball(mouseX, mouseY, 20));
}

function solveCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      const axis = p5.Vector.sub(a.pos, b.pos);
      const dist = axis.mag();
      const minDist = a.r + b.r;
      if (dist < minDist && dist > 0) {
        const n = axis.div(dist);
        const push = (minDist - dist) / 2;
        a.pos.add(p5.Vector.mult(n, push));
        b.pos.sub(p5.Vector.mult(n, push));
      }
    }
  }
}

function draw() {
  background(30);
  const dt = 1 / 60;
  for (const b of balls) {
    b.accelerate(createVector(0, GRAVITY));
    b.update(dt);
  }
  solveCollisions();
  for (const b of balls) {
    b.constrainToBox();
    b.show();
  }
}
```

### Full references at https://p5js.org/reference/
