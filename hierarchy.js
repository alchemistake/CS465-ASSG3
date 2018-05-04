// Height Width information of each joint and room
const roomSize = 50.0;
const surfaceSize = 1.0;

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
            m = translate(0, 0, 0);
            figure[key] = createNode(m, function () {
                instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0));
                instanceMatrix = mult(instanceMatrix, scale4(roomSize, roomSize, roomSize));
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
                for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
            }, null, "surface");
            break;
        case "surface":
            m = translate(0, 0, 0);
            figure[key] = createNode(m, renderGenerator(surfaceSize, surfaceSize), null, null);
            break;
    }
}