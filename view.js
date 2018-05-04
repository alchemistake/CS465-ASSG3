// Camera movement angles on their axis
let cameraX = 0.0, cameraY = 0.0;

let canvas;
let gl;
let program;

let projectionMatrix;
let modelViewMatrix;

let instanceMatrix;
let modelViewMatrixLoc;

// Textures are hold here to have access from multiple scripts
let textures = {
    "bg": null,
};

let vertices = [
    // Vertices of cube
    // Front face
    -50., -50., 50.,
    50., -50., 50.,
    50., 50., 50.,
    -50., 50., 50.,
    // Back face
    -50., -50., -50.,
    -50., 50., -50.,
    50., 50., -50.,
    50., -50., -50.,
    // Top face
    -50., 50., -50.,
    -50., 50., 50.,
    50., 50., 50.,
    50., 50., -50.,
    // Bottom face
    -50., -50., -50.,
    50., -50., -50.,
    50., -50., 50.,
    -50., -50., 50.,
    // Right face
    50., -50., -50.,
    50., 50., -50.,
    50., 50., 50.,
    50., -50., 50.,
    // Left face
    -50., -50., -50.,
    -50., -50., 50.,
    -50., 50., 50.,
    -50., 50., -50.,
];

let textureCoords = [
    // Coordinates of cube
    // Front face
    -4.5, -4.5,
    5.5, -4.5,
    5.5, 5.5,
    -4.5, 5.5,
    // Back face
    5.5, -4.5,
    5.5, 5.5,
    -4.5, 5.5,
    -4.5, -4.5,
    // Top face
    -4.5, 5.5,
    -4.5, -4.5,
    5.5, -4.5,
    5.5, 5.5,
    // Bottom face
    5.5, 5.5,
    -4.5, 5.5,
    -4.5, -4.5,
    5.5, -4.5,
    // Right face
    5.5, -4.5,
    5.5, 5.5,
    -4.5, 5.5,
    -4.5, -4.5,
    // Left face
    -4.5, -4.5,
    5.5, -4.5,
    5.5, 5.5,
    -4.5, 5.5,
];

let vertexIndices = [
    // Indices of cuve
    0, 1, 2, 0, 2, 3,    // Front face
    4, 5, 6, 4, 6, 7,    // Back face
    8, 9, 10, 8, 10, 11,  // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23  // Left face
];

let vertexPositionBuffer;
let vertexTextureCoordBuffer;
let vertexIndexBuffer;

let cameraDistance = 25.0;
let cameraMinDistance = 5.0;
let cameraMaxDistance = 35.0;
let cameraPosition = vec4(cameraDistance, 0., 0., 0.);
let upPosition = add(cameraPosition, vec4(0., 1., 0., 0.));

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.5, .5, .5, 1.0);
    // Depth test was not enable in the original
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");

    // Create the texture for later use
    generateTexture("bg");
    gl.activeTexture(gl.TEXTURE0);
    changeTexture("bg");

    gl.useProgram(program);

    program.vertexPositionAttribute = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.textureCoordAttribute = gl.getAttribLocation(program, "vTexPosition");
    gl.enableVertexAttribArray(program.textureCoordAttribute);

    instanceMatrix = mat4();

    // Projection is changed to perspective for more realistic look
    projectionMatrix = perspective(45., (1. * canvas.clientWidth) / canvas.clientHeight, 10, 150.);

    modelViewMatrix = lookAt(vec3(cameraPosition), vec3(0, 0, 0), vec3(subtract(upPosition, cameraPosition)));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numItems = vertices.length / vertexPositionBuffer.itemSize;

    vertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    vertexTextureCoordBuffer.itemSize = 2;
    vertexTextureCoordBuffer.numItems = textureCoords.length / vertexTextureCoordBuffer.itemSize;

    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    vertexIndexBuffer.itemSize = 1;
    vertexIndexBuffer.numItems = vertexIndices.length / vertexIndexBuffer.itemSize;

    render();
};

// Applies the updates in joint variables as transformations and renders the new position
function render() {
    let currentCamera = mult(mult(mat4(cameraPosition, upPosition), rotate(cameraX, 0, 1, 0)), rotate(cameraY, 0, 0, 1));

    modelViewMatrix = lookAt(vec3(currentCamera[0]), vec3(0, 0, 0), vec3(subtract(currentCamera[1], currentCamera[0])));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
    gl.vertexAttribPointer(program.textureCoordAttribute, vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

// Creates texture object
function generateTexture(textureName) {
    textures[textureName] = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, textures[textureName]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById(textureName));
}

// Wrapper for gl.bindTexture function to increase ease of use
function changeTexture(name) {
    gl.bindTexture(gl.TEXTURE_2D, textures[name]);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
}