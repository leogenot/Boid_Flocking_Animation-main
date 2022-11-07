class Particle {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D(0.5, 1.5);
        this.acceleration = createVector();
        this.maxForce = 0.05;
        this.maxSpeed = 8;
        this.r = 5;
    }
    //function to draw the particle on the canvas
    Show(r, g, b, type = "triangle") {

        stroke(r, g, b);
        fill(200, 100);
        push();

        let direction = this.velocity.heading() + radians(90);
        translate(this.position.x, this.position.y);
        rotate(direction);
        type == "triangle" ? triangle(0, -this.r * 2, -this.r, this.r * 2, this.r, this.r * 2) : ellipse(0, 0, 50);

        pop();

    }

    //function to update the particle's position
    Move() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
    }

    //function to update the particles alignment with the other particles
    Alignment(Particles) {

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
            avgVelocity.setMag(this.maxSpeed);
            avgVelocity.sub(this.velocity);
            avgVelocity.limit(this.maxForce);
        }

        return avgVelocity;


    }
    //function to update the particle's cohesion with the other particles
    Cohesion(Particles) {

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
            avgPosition.setMag(this.maxSpeed);
            avgPosition.sub(this.velocity);
            avgPosition.limit(this.maxForce);
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

        let align = this.Alignment(Particles);
        let cohesion = this.Cohesion(Particles);
        let separation = this.Separation(Particles);
        let pray = this.MouseSeparation(Particles);
        let predator = this.AvoidPredator(Predator);
        let obstacles = this.AvoidPredator(Obstacle);
        this.velocity.add(predator);
        this.velocity.add(obstacles);
        this.velocity.add(pray);
        this.velocity.add(separation);
        this.velocity.limit(this.maxSpeed);
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