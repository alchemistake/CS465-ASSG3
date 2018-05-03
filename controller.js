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

c.addEventListener("mouseup", finish);
c.addEventListener("mouseleave", finish);