// -------------------
//  Parameters and UI
// -------------------

const gui = new dat.GUI()
const params = {
    FlockSize: 100,
    Predators: 10,
    Obstacles: 10,
    MaxForce: 0.05,
    MaxSpeed: 8,
    Size: 5,
    Download_Image: () => save(),
}
gui.add(params, "FlockSize", 0, 500, 1).onChange(function (value) {
    flock = [];
    for (let i = 0; i < value; i++) {
        flock.push(new Particle());
    }
});
gui.add(params, "Predators", 0, 20, 1).onChange(function (value) {
    predator = [];
    for (let i = 0; i < value; i++) {
        predator.push(new Particle());
    }
});
gui.add(params, "Obstacles", 0, 20, 1).onChange(function (value) {
    obstacle = [];
    for (let i = 0; i < value; i++) {
        obstacle.push(new Particle());
    }
});
gui.add(params, "MaxForce", 0, 1, 0.01)
gui.add(params, "MaxSpeed", 0, 20, 1)
gui.add(params, "Size", 0, 20, 1)
gui.add(params, "Download_Image")

// -------------------
//       Cursor functions
// -------------------

document.addEventListener('DOMContentLoaded', () => {
    let mousePosX = 0,
        mousePosY = 0,
        mouseCircle = document.getElementById('mouse-circle');

    document.onmousemove = (e) => {
        mousePosX = e.pageX;
        mousePosY = e.pageY;
    }

    let delay = 6,
        revisedMousePosX = 0,
        revisedMousePosY = 0;

    function delayMouseFollow() {
        requestAnimationFrame(delayMouseFollow);

        revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
        revisedMousePosY += (mousePosY - revisedMousePosY) / delay;

        mouseCircle.style.top = revisedMousePosY + 'px';
        mouseCircle.style.left = revisedMousePosX + 'px';
    }
    delayMouseFollow();
});


// -------------------
//       Boid particle class
// -------------------

class Particle {
    position: p5.Vector
    velocity: p5.Vector
    acceleration: p5.Vector
    maxSpeed: number
    maxForce: number
    size: number

    constructor() {
        this.position = createVector(random(width), random(height))
        this.velocity = createVector(random(-1, 1), random(-1, 1))
        this.acceleration = createVector()
        this.maxSpeed = params.MaxSpeed
        this.maxForce = params.MaxForce
        this.size = params.Size
    }

    //function to draw the particle on the canvas
    Show(r, g, b, type = "triangle", particleSize = this.size) {

        stroke(r, g, b);
        fill(200, 100);
        push();

        let direction = this.velocity.heading() + radians(90);
        translate(this.position.x, this.position.y);
        rotate(direction);
        type == "triangle" ? triangle(0, -particleSize * 2, -particleSize, particleSize * 2, particleSize, particleSize * 2) : ellipse(0, 0, 50);

        pop();

    }

    //function to update the particle's position
    Move(particlaMaxSpeed = this.maxSpeed) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.add(this.acceleration);
        this.velocity.limit(particlaMaxSpeed);
    }

    //function to update the particles alignment with the other particles
    Alignment(Particles, particlaMaxSpeed = this.maxSpeed, particlaMaxForce = this.maxForce) {

        let avgVelocity = createVector();
        const perception = 100;
        let neighbors = 0;

        for (let otherParticle of Particles) {

            let distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);

            if (distance < perception && this != otherParticle) {
                avgVelocity.add(otherParticle.velocity);
                neighbors++;
            }

        }

        if (neighbors) {
            avgVelocity.div(neighbors);
            avgVelocity.setMag(particlaMaxSpeed);
            avgVelocity.sub(this.velocity);
            avgVelocity.limit(particlaMaxForce);
        }

        return avgVelocity;


    }
    //function to update the particle's cohesion with the other particles
    Cohesion(Particles, particlaMaxSpeed = this.maxSpeed, particlaMaxForce = this.maxForce) {

        let avgPosition = createVector();
        const perception = 100;
        let neighbors = 0;

        for (let otherParticle of Particles) {

            let distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);

            if (distance < perception && this != otherParticle) {
                avgPosition.add(otherParticle.position);
                neighbors++;
            }

        }

        if (neighbors > 0) {
            avgPosition.div(neighbors);
            avgPosition.sub(this.position);
            avgPosition.setMag(particlaMaxSpeed);
            avgPosition.sub(this.velocity);
            avgPosition.limit(particlaMaxForce);
        }

        return avgPosition;


    }

    //function to update the particle's direction offset
    Separation(Particles) {

        let v = createVector();
        const perception = 50;
        const avoidFactor = 0.005;


        for (let otherParticle of Particles) {

            let distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
            if (distance < perception && otherParticle != this) {
                v.x = this.position.x - otherParticle.position.x;
                v.y = this.position.y - otherParticle.position.y;

            }


        }
        for (let otherParticle of Particles) {

            let distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
            if (distance < perception && otherParticle != this) {
                v.x = this.position.x - otherParticle.position.x;
                v.y = this.position.y - otherParticle.position.y;

            }


        }

        v.x *= avoidFactor;
        v.y *= avoidFactor;

        return v;

    }

    //function to make particles bounce off predators and obstacles
    AvoidPredator(Particles) {

        let v = createVector();
        const perception = 50;
        const avoidFactor = 0.5;


        for (let otherParticle of Particles) {

            let distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
            if (distance < perception && otherParticle != this) {
                v.x = this.position.x - otherParticle.position.x;
                v.y = this.position.y - otherParticle.position.y;

            }


        }
        for (let otherParticle of Particles) {

            let distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
            if (distance < perception && otherParticle != this) {
                v.x = this.position.x - otherParticle.position.x;
                v.y = this.position.y - otherParticle.position.y;

            }


        }

        v.x *= avoidFactor;
        v.y *= avoidFactor;

        return v;

    }

    //function to make particles bounce off mouse
    MouseSeparation(Particles) {

        let v = createVector();
        const perception = 50;
        const avoidFactor = 1;


        for (let otherParticle of Particles) {


            let distance2 = dist(this.position.x, this.position.y, mouseX, mouseY);
            if (distance2 < perception) {

                v.x = this.position.x - mouseX;
                v.y = this.position.y - mouseY;

            }

        }

        v.x *= avoidFactor;
        v.y *= avoidFactor;

        return v;

    }

    //function to make particles init direction, speed, position and object avoidance
    FlockMove(Particles, Predator, Obstacle) {

        let align = this.Alignment(Particles, params.MaxSpeed, params.MaxForce);
        let cohesion = this.Cohesion(Particles, params.MaxSpeed, params.MaxForce);
        let separation = this.Separation(Particles);
        let pray = this.MouseSeparation(Particles);
        let predator = this.AvoidPredator(Predator);
        let obstacles = this.AvoidPredator(Obstacle);
        this.velocity.add(predator);
        this.velocity.add(obstacles);
        this.velocity.add(pray);
        this.velocity.add(separation);
        this.velocity.limit(params.MaxSpeed);
        this.acceleration.set(0, 0);
        this.acceleration.add(align);
        this.acceleration.add(cohesion);
    }

    //function to check if the particle is out of bounds and if so, make it reappear on the other side
    EdgeDetection() {
        if (this.position.x > width - 4 || this.position.x < 4) {
            this.velocity.x *= -1;
        }

        if (this.position.y > height - 4 || this.position.y < 4) {
            this.velocity.y *= -1;
        }

    }
}


// -------------------
//       Drawing
// -------------------

function draw() {
    background("black")
    for (let particle of flock) {
        particle.Show(255, 255, 255, "triangle", params.Size);
        particle.EdgeDetection();
        particle.Move(params.MaxSpeed);
        particle.FlockMove(flock, predator, obstacle);
    }
    for (let particle of predator) {
        particle.Show(255, 0, 0);
        particle.EdgeDetection();
        particle.Move();
    }
    for (let particle of obstacle) {
        particle.Show(255, 0, 0, "circle");
        particle.EdgeDetection();
    }


}

// -------------------
//    Initialization
// -------------------

let flock: Array<Particle> = [];
let predator: Array<Particle> = [];
let obstacle: Array<Particle> = [];

function setup() {
    p6_CreateCanvas()
    for (let i = 0; i < params.FlockSize; i++) {
        flock.push(new Particle());
    }
    for (let i = 0; i < params.Predators; i++) {
        predator.push(new Particle());
    }
    for (let i = 0; i < params.Obstacles; i++) {
        obstacle.push(new Particle());
    }
}

function windowResized() {
    p6_ResizeCanvas()
}
