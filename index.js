let pendulumCanvas = document.getElementById('pendulum');
let pendulumContext = pendulumCanvas.getContext('2d');
let massSlider = document.getElementById('mass-slider');
let pendulum = new Pendulum(n = parseInt(massSlider.value),
                            thetas = Array(n).fill(Math.PI*Math.random() - Math.PI/2),
                            thetaDots = Array(n).fill(5*Math.random() - 2.5));

let pendulumColor = 'rgb(2,50,80)';
let traceColor = 'rgba(2,50,80, 0.2)';

let xScale = x => x * (0.4*(pendulumCanvas.width)/pendulum.n);
let yScale = x => -x * (0.4*(pendulumCanvas.height)/pendulum.n);

let last = 0;
let dtMax = 30;
let traceMax = 400;

function pendulumDraw() {
    let coords = pendulum.coordinates;

    let x1 = 0.5*pendulumCanvas.width;
    let y1 = 0.5*pendulumCanvas.height;
    pendulumContext.beginPath();
    pendulumContext.arc(x1, y1, 5, 0, 2 * Math.PI);
    pendulumContext.fill();

    for (let i = 0; i < pendulum.n; i++) {
        let x2 = 0.5*pendulumCanvas.width + xScale(coords[i].x);
        let y2 = 0.5*pendulumCanvas.height + yScale(coords[i].y);

        pendulumContext.fillStyle = pendulumColor;
        pendulumContext.strokeStyle = pendulumColor;
        pendulumContext.lineWidth = 5;
        pendulumContext.beginPath();
        pendulumContext.moveTo(x1, y1);
        pendulumContext.lineTo(x2, y2);
        pendulumContext.stroke();

        pendulumContext.beginPath();
        pendulumContext.arc(x2, y2, 5, 0, 2 * Math.PI);
        pendulumContext.fill();

        x1 = x2;
        y1 = y2;
    }
    return {x: x1, y: y1};
}

let h = {
    i: 0,
    length: 0,
    v: new Float32Array(traceMax * 2),
    push: function(coord) {
        h.v[h.i * 2 + 0] = coord.x;
        h.v[h.i * 2 + 1] = coord.y;
        h.i = (h.i + 1) % traceMax;
        if (h.length < traceMax)
            h.length++;
    },
    visit: function(f) {
        for (let j = h.i + traceMax - 2; j > h.i + traceMax - h.length - 1; j--) {
            let a = (j + 1) % traceMax;
            let b = (j + 0) % traceMax;
            f(h.v[a * 2], h.v[a * 2 + 1], h.v[b * 2], h.v[b * 2 + 1]);
        }
    }
};

function drawTrace() {
    let traceCount = traceMax;
    h.visit(function(x1, y1, x2, y2) {
        pendulumContext.globalAlpha = traceCount-- / h.length;
        pendulumContext.strokeStyle = traceColor;
        pendulumContext.beginPath();
        pendulumContext.moveTo(x1, y1);
        pendulumContext.lineTo(x2, y2);
        pendulumContext.stroke();
    });
    pendulumContext.globalAlpha = 1;

}

function updatePendulumMass() {
    let newN = parseInt(massSlider.value);
    if (pendulum.n < newN) {
        pendulum.thetas = pendulum.thetas.concat(Array(newN - pendulum.n).fill(pendulum.thetas[pendulum.thetas.length - 1]));
        pendulum.thetaDots = pendulum.thetaDots.concat(Array(newN - pendulum.n).fill(10*Math.random() - 5));
    }
    else if (pendulum.n > newN) {
        pendulum.thetas = pendulum.thetas.slice(0, newN);
        pendulum.thetaDots = pendulum.thetaDots.slice(0, newN);
    }
    pendulum.n = newN;
}

function clipSpeed() {
    for (let i = 0; i < pendulum.n; i++) {
        pendulum.thetaDots[i] = Math.min(Math.max(pendulum.thetaDots[i], -25), 25);
    }
}

function animate(t) {

    parentWidth = pendulumCanvas.parentElement.clientWidth;
    parentHeight = pendulumCanvas.parentElement.clientHeight;
    let minDim = Math.min(parentWidth, parentHeight);
    if (pendulumCanvas.width != minDim || pendulumCanvas.height != minDim) {
        pendulumCanvas.width = minDim;
        pendulumCanvas.height = minDim;
    }

    clipSpeed();
    updatePendulumMass();

    pendulumContext.clearRect(0, 0, pendulumCanvas.width, pendulumCanvas.height);
    dt = Math.min(dtMax, (t - last));
    pendulum.tick(dt / 1000);

    newCoord = pendulumDraw();

    
    h.push(newCoord);

    drawTrace();

    last = t

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);