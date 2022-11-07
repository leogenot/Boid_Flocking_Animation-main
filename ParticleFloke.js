const width = window.innerWidth;
const height = window.innerHeight;

const flock = [];
const predator = [];
const obstacle = [];

//init flock of particles
function setup() {
    createCanvas(width, height);
    for (let i = 0; i < 100; i++) {
        flock.push(new Particle());
    }
    for (let i = 0; i < 10; i++) {
        predator.push(new Particle());
    }
    for (let i = 0; i < 10; i++) {
        obstacle.push(new Particle());
    }
}

//draw particles
function draw() {

    background(0);

    for (let particle of flock) {
        particle.Show(255, 255, 255);
        particle.EdgeDetection();
        particle.Move();
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




