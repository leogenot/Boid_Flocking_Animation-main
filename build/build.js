var gui = new dat.GUI();
var params = {
    FlockSize: 100,
    Predators: 10,
    Obstacles: 10,
    MaxForce: 0.05,
    MaxSpeed: 8,
    Size: 5,
    Download_Image: function () { return save(); },
};
gui.add(params, "FlockSize", 0, 500, 1).onChange(function (value) {
    flock = [];
    for (var i = 0; i < value; i++) {
        flock.push(new Particle());
    }
});
gui.add(params, "Predators", 0, 20, 1).onChange(function (value) {
    predator = [];
    for (var i = 0; i < value; i++) {
        predator.push(new Particle());
    }
});
gui.add(params, "Obstacles", 0, 20, 1).onChange(function (value) {
    obstacle = [];
    for (var i = 0; i < value; i++) {
        obstacle.push(new Particle());
    }
});
gui.add(params, "MaxForce", 0, 1, 0.01);
gui.add(params, "MaxSpeed", 0, 20, 1);
gui.add(params, "Size", 0, 20, 1);
gui.add(params, "Download_Image");
document.addEventListener('DOMContentLoaded', function () {
    var mousePosX = 0, mousePosY = 0, mouseCircle = document.getElementById('mouse-circle');
    document.onmousemove = function (e) {
        mousePosX = e.pageX;
        mousePosY = e.pageY;
    };
    var delay = 6, revisedMousePosX = 0, revisedMousePosY = 0;
    function delayMouseFollow() {
        requestAnimationFrame(delayMouseFollow);
        revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
        revisedMousePosY += (mousePosY - revisedMousePosY) / delay;
        mouseCircle.style.top = revisedMousePosY + 'px';
        mouseCircle.style.left = revisedMousePosX + 'px';
    }
    delayMouseFollow();
});
var Particle = (function () {
    function Particle() {
        this.position = createVector(random(width), random(height));
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.acceleration = createVector();
        this.maxSpeed = params.MaxSpeed;
        this.maxForce = params.MaxForce;
        this.size = params.Size;
    }
    Particle.prototype.Show = function (r, g, b, type, particleSize) {
        if (type === void 0) { type = "triangle"; }
        if (particleSize === void 0) { particleSize = this.size; }
        stroke(r, g, b);
        fill(200, 100);
        push();
        var direction = this.velocity.heading() + radians(90);
        translate(this.position.x, this.position.y);
        rotate(direction);
        type == "triangle" ? triangle(0, -particleSize * 2, -particleSize, particleSize * 2, particleSize, particleSize * 2) : ellipse(0, 0, 50);
        pop();
    };
    Particle.prototype.Move = function (particlaMaxSpeed) {
        if (particlaMaxSpeed === void 0) { particlaMaxSpeed = this.maxSpeed; }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.add(this.acceleration);
        this.velocity.limit(particlaMaxSpeed);
    };
    Particle.prototype.Alignment = function (Particles, particlaMaxSpeed, particlaMaxForce) {
        if (particlaMaxSpeed === void 0) { particlaMaxSpeed = this.maxSpeed; }
        if (particlaMaxForce === void 0) { particlaMaxForce = this.maxForce; }
        var avgVelocity = createVector();
        var perception = 100;
        var neighbors = 0;
        for (var _i = 0, Particles_1 = Particles; _i < Particles_1.length; _i++) {
            var otherParticle = Particles_1[_i];
            var distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
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
    };
    Particle.prototype.Cohesion = function (Particles, particlaMaxSpeed, particlaMaxForce) {
        if (particlaMaxSpeed === void 0) { particlaMaxSpeed = this.maxSpeed; }
        if (particlaMaxForce === void 0) { particlaMaxForce = this.maxForce; }
        var avgPosition = createVector();
        var perception = 100;
        var neighbors = 0;
        for (var _i = 0, Particles_2 = Particles; _i < Particles_2.length; _i++) {
            var otherParticle = Particles_2[_i];
            var distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
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
    };
    Particle.prototype.Separation = function (Particles) {
        var v = createVector();
        var perception = 50;
        var avoidFactor = 0.005;
        for (var _i = 0, Particles_3 = Particles; _i < Particles_3.length; _i++) {
            var otherParticle = Particles_3[_i];
            var distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
            if (distance < perception && otherParticle != this) {
                v.x = this.position.x - otherParticle.position.x;
                v.y = this.position.y - otherParticle.position.y;
            }
        }
        v.x *= avoidFactor;
        v.y *= avoidFactor;
        return v;
    };
    Particle.prototype.AvoidPredator = function (Particles) {
        var v = createVector();
        var perception = 50;
        var avoidFactor = 0.5;
        for (var _i = 0, Particles_4 = Particles; _i < Particles_4.length; _i++) {
            var otherParticle = Particles_4[_i];
            var distance = dist(this.position.x, this.position.y, otherParticle.position.x, otherParticle.position.y);
            if (distance < perception && otherParticle != this) {
                v.x = this.position.x - otherParticle.position.x;
                v.y = this.position.y - otherParticle.position.y;
            }
        }
        v.x *= avoidFactor;
        v.y *= avoidFactor;
        return v;
    };
    Particle.prototype.MouseSeparation = function (Particles) {
        var v = createVector();
        var perception = 50;
        var avoidFactor = 1;
        for (var _i = 0, Particles_5 = Particles; _i < Particles_5.length; _i++) {
            var otherParticle = Particles_5[_i];
            var distance = dist(this.position.x, this.position.y, mouseX, mouseY);
            if (distance < perception) {
                v.x = this.position.x - mouseX;
                v.y = this.position.y - mouseY;
            }
        }
        v.x *= avoidFactor;
        v.y *= avoidFactor;
        return v;
    };
    Particle.prototype.FlockMove = function (Particles, Predator, Obstacle) {
        var align = this.Alignment(Particles, params.MaxSpeed, params.MaxForce);
        var cohesion = this.Cohesion(Particles, params.MaxSpeed, params.MaxForce);
        var separation = this.Separation(Particles);
        var pray = this.MouseSeparation(Particles);
        var predator = this.AvoidPredator(Predator);
        var obstacles = this.AvoidPredator(Obstacle);
        this.velocity.add(predator);
        this.velocity.add(obstacles);
        this.velocity.add(pray);
        this.velocity.add(separation);
        this.velocity.limit(params.MaxSpeed);
        this.acceleration.set(0, 0);
        this.acceleration.add(align);
        this.acceleration.add(cohesion);
    };
    Particle.prototype.EdgeDetection = function () {
        if (this.position.x > width - 4 || this.position.x < 4) {
            this.velocity.x *= -1;
        }
        if (this.position.y > height - 4 || this.position.y < 4) {
            this.velocity.y *= -1;
        }
    };
    return Particle;
}());
function draw() {
    background("black");
    for (var _i = 0, flock_1 = flock; _i < flock_1.length; _i++) {
        var particle = flock_1[_i];
        particle.Show(255, 255, 255, "triangle", params.Size);
        particle.EdgeDetection();
        particle.Move(params.MaxSpeed);
        particle.FlockMove(flock, predator, obstacle);
    }
    for (var _a = 0, predator_1 = predator; _a < predator_1.length; _a++) {
        var particle = predator_1[_a];
        particle.Show(255, 0, 0);
        particle.EdgeDetection();
        particle.Move();
    }
    for (var _b = 0, obstacle_1 = obstacle; _b < obstacle_1.length; _b++) {
        var particle = obstacle_1[_b];
        particle.Show(255, 0, 0, "circle");
        particle.EdgeDetection();
    }
}
var flock = [];
var predator = [];
var obstacle = [];
function setup() {
    p6_CreateCanvas();
    for (var i = 0; i < params.FlockSize; i++) {
        flock.push(new Particle());
    }
    for (var i = 0; i < params.Predators; i++) {
        predator.push(new Particle());
    }
    for (var i = 0; i < params.Obstacles; i++) {
        obstacle.push(new Particle());
    }
}
function windowResized() {
    p6_ResizeCanvas();
}
var __ASPECT_RATIO = 1;
var __MARGIN_SIZE = 25;
function __desiredCanvasWidth() {
    var windowRatio = windowWidth / windowHeight;
    if (__ASPECT_RATIO > windowRatio) {
        return windowWidth - __MARGIN_SIZE * 2;
    }
    else {
        return __desiredCanvasHeight() * __ASPECT_RATIO;
    }
}
function __desiredCanvasHeight() {
    var windowRatio = windowWidth / windowHeight;
    if (__ASPECT_RATIO > windowRatio) {
        return __desiredCanvasWidth() / __ASPECT_RATIO;
    }
    else {
        return windowHeight - __MARGIN_SIZE * 2;
    }
}
var __canvas;
function __centerCanvas() {
    __canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}
function p6_CreateCanvas() {
    __canvas = createCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
    __centerCanvas();
}
function p6_ResizeCanvas() {
    resizeCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
    __centerCanvas();
}
var p6_SaveImageSequence = function (durationInFrames, fileExtension) {
    if (frameCount <= durationInFrames) {
        noLoop();
        var filename_1 = nf(frameCount - 1, ceil(log(durationInFrames) / log(10)));
        var mimeType = (function () {
            switch (fileExtension) {
                case 'png':
                    return 'image/png';
                case 'jpeg':
                case 'jpg':
                    return 'image/jpeg';
            }
        })();
        __canvas.elt.toBlob(function (blob) {
            p5.prototype.downloadFile(blob, filename_1, fileExtension);
            setTimeout(function () { return loop(); }, 100);
        }, mimeType);
    }
};
//# sourceMappingURL=../src/src/build.js.map