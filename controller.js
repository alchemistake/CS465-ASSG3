const fps = 60.;
const mspf = 1000 / fps;

const c = document.getElementById("gl-canvas");
c.width = c.parentElement.clientWidth;
c.height = c.parentElement.clientHeight;

// Camera logic
let prevX, prevY, lastUpdate = 0;

// Tracks how much mouse has been moved since last update
function camera(event) {
    if (Date.now() - lastUpdate > mspf) {
        const deltaX = (event.clientX - prevX) / c.width;
        const deltaY = (event.clientY - prevY) / c.height;

        cameraX += -1 * deltaX * 180;
        cameraY += deltaY * 180;

        prevX = event.clientX;
        prevY = event.clientY;

        requestAnimFrame(render);
        lastUpdate = Date.now();
    }
}

// Adds camera movement listeners when mouse is down
c.addEventListener("mousedown", function (event) {
    prevX = event.clientX;
    prevY = event.clientY;

    c.addEventListener("mousemove", camera)
});

// Removes camera movement listeners when mouse is up
function finish() {
    c.removeEventListener("mousemove", camera);
}

function zoom() {
    const speed = 2;
    if (Date.now() - lastUpdate > mspf) {
        let e = window.event || e; // old IE support
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        cameraDistance += delta * speed;
        cameraDistance = Math.min(Math.max(cameraDistance, cameraMinDistance), cameraMaxDistance);
        cameraPosition = vec4(cameraDistance, 0., 0., 0.);
        upPosition = add(cameraPosition, vec4(0., 1., 0., 0.));

        requestAnimFrame(render);
    }
}

c.addEventListener("mouseup", finish);
c.addEventListener("mouseleave", finish);
c.addEventListener("mousewheel", zoom);

function showOptions() {
    document.getElementById("controls").hidden = !document.getElementById("controls").hidden;
}

function changeNoControlPoints() {
    noControlPoints = [parseInt(document.getElementById("noControlPointsX").value), parseInt(document.getElementById("noControlPointsY").value)];

    generateControlPoints();
    generateCombinations();
    runGrid();
    surface["vPos"] = surfaceVertexPos;
    surface["tPos"] = surfaceTextPos;
    surface["index"] = surfaceIndex;
    surface["normal"] = surfaceNormal;
    initializeObject(surface);
    requestAnimationFrame(render);
}

function changeNoStep() {
    noStep = parseInt(document.getElementById("noStep").value);
    stepSize = 1. / noStep;

    runGrid();
    surface["vPos"] = surfaceVertexPos;
    surface["tPos"] = surfaceTextPos;
    surface["index"] = surfaceIndex;
    surface["normal"] = surfaceNormal;
    initializeObject(surface);
    requestAnimationFrame(render);
}

function updateAmbient() {
    if (Date.now() - lastUpdate > mspf) {
        cube["amb"] = parseFloat(document.getElementById("cubeAmb").value);
        surface["amb"] = parseFloat(document.getElementById("surfaceAmb").value);
        intensityAmb = parseFloat(document.getElementById("intensityAmb").value);
        requestAnimationFrame(render);
    }
}

function pointOnCanvas(event) {
    let x = event.x;
    let y = event.y;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    x = -1 + 2 * x / canvas.width;
    y = 1 + -2 * y / canvas.height;
    return vec2(x, y);
}