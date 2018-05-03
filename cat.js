// Height Width information of each joint and room
const roomSize = 50.0;
const surfaceSize = 10.0;

// Camera movement angles on their axis
let cameraX = 0.0, cameraY = 0.0;

// Object for hierarchy nodes
function createNode(transform, render, sibling, child) {
    return {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child
    };
}

// The main function that defines hierarchy
function initNodes(key) {
    let m = mat4();

    switch (key) {
        case "room":
            m = translate(0.0, -0.5 * roomSize, -0.6 * roomSize);
            m = mult(m, rotate(cameraY, 1, 0, 0));
            m = mult(m, rotate(cameraX, 0, 1, 0));
            figure[key] = createNode(m, renderGenerator(roomSize, roomSize), null, "surface");
            break;
        case "surface":
            m = translate(-surfaceSize * 0.5, -surfaceSize * 0.5, -surfaceSize * 0.5);
            figure[key] = createNode(m, renderGenerator(surfaceSize, surfaceSize), null, null);
            break;
    }
}