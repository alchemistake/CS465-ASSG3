// Camera
let cameraX = 0.0, cameraY = 0.0;
let cameraDistance = 25.0;
let cameraMinDistance = 5.0;
let cameraMaxDistance = 45.0;
let cameraPosition = vec4(cameraDistance);
let upPosition = add(cameraPosition, vec4(0., 1.));

let canvas;
let gl;
let curProgram, wireframeProgram, gouraudProgram, phongProgram;

let projectionMatrix;
let modelViewMatrix;
let modelViewMatrixLoc;

let intensityAmb = 0.5, intensityLight = 0.5;

// Textures are hold here to have access from multiple scripts
let textures = {};
let activeTexture = "marble";

// Cube constants
const cubeVertexPos = [
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
const cubeTextPos = [
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
const cubeIndex = [
    0, 1, 2, 0, 2, 3,    // Front face
    4, 5, 6, 4, 6, 7,    // Back face
    8, 9, 10, 8, 10, 11,  // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23  // Left face
];
const cubeWireframeIndex = [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 1, 7, 3, 5, 2, 6, 4, 5, 5, 6, 6, 7, 7, 4];
let cubeNormal = [];
for (let i = 0; i < cubeVertexPos.length; i++) {
    cubeNormal.push(cubeVertexPos[i] / Math.sqrt(3 * 50 * 50));
}

// Objects
let cube, surface;

let currentShader = "wireframe";

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1., 1., 1., 1.);
    gl.enable(gl.DEPTH_TEST);

    cube = generateObject(cubeVertexPos, cubeTextPos, cubeWireframeIndex, cubeNormal, .5, .5, .5);
    initializeObject(cube);

    generateControlPoints();
    generateCombinations();
    runGrid();

    surface = generateObject(surfaceVertexPos, surfaceTextPos, surfaceWireframeIndex, surfaceNormal, .5, .5, .5);
    initializeObject(surface);

    wireframeProgram = initShaders(gl, "wireframe-vs", "wireframe-fs");
    gouraudProgram = initShaders(gl, "gouraud-vs", "gouraud-fs");
    phongProgram = initShaders(gl, "phong-vs", "phong-fs");
    // loadWireframeShader();
    loadGouraudShader();

    generateTexture("kulaksız");
    generateTexture("bg");
    generateTexture("marble");
    gl.activeTexture(gl.TEXTURE0);

    addRemoveControlPoints();

    render();
};

// Applies the updates in joint variables as transformations and renders the new position
function render() {
    let currentCamera = mult(mult(mat4(cameraPosition, upPosition), rotate(cameraX, 0, 1, 0)), rotate(cameraY, 0, 0, 1));

    modelViewMatrix = lookAt(vec3(currentCamera[0]), vec3(0, 0, 0), vec3(subtract(currentCamera[1], currentCamera[0])));

    if (currentCamera !== "wireframe") {
        gl.uniform3fv(gl.getUniformLocation(curProgram, "cameraPosition"), vec3(currentCamera[0]));
        gl.uniform3fv(gl.getUniformLocation(curProgram, "lightPosition"), new Float32Array([parseFloat(document.getElementById("positionX").value), parseFloat(document.getElementById("positionY").value), parseFloat(document.getElementById("positionZ").value)]));
    }

    gl.uniformMatrix4fv(gl.getUniformLocation(curProgram, "modelViewMatrix"), false, flatten(modelViewMatrix));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (currentShader !== "wireframe")
        changeTexture("bg");
    renderObject(cube);
    if (currentShader !== "wireframe")
        changeTexture(activeTexture);
    renderObject(surface);
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

// Object system
function generateObject(vPos, tPos, index, normal, amb, diff, spec) {
    return {
        "vPos": vPos,
        "tPos": tPos,
        "normal": normal,
        "index": index,
        "amb": amb,
        "diff": diff,
        "spec": spec,
        "vBuf": gl.createBuffer(),
        "tBuf": gl.createBuffer(),
        "iBuf": gl.createBuffer(),
        "nBuf": gl.createBuffer()
    }
}

function initializeObject(obj) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj["vBuf"]);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj["vPos"]), gl.STATIC_DRAW);
    obj["vBuf"].itemSize = 3;
    obj["vBuf"].numItems = obj["vPos"].length / obj["vBuf"].itemSize;

    gl.bindBuffer(gl.ARRAY_BUFFER, obj["tBuf"]);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj["tPos"]), gl.STATIC_DRAW);
    obj["tBuf"].itemSize = 2;
    obj["tBuf"].numItems = obj["tPos"].length / obj["tBuf"].itemSize;

    gl.bindBuffer(gl.ARRAY_BUFFER, obj["nBuf"]);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(obj["normal"]), gl.STATIC_DRAW);
    obj["nBuf"].itemSize = 3;
    obj["nBuf"].numItems = obj["tPos"].length / obj["nBuf"].itemSize;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj["iBuf"]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj["index"]), gl.STATIC_DRAW);
    obj["iBuf"].itemSize = 1;
    obj["iBuf"].numItems = obj["index"].length / obj["iBuf"].itemSize;
}

function renderObject(obj) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj["vBuf"]);
    gl.vertexAttribPointer(curProgram.vertexPositionAttribute, obj["vBuf"].itemSize, gl.FLOAT, false, 0, 0);

    if (currentShader !== "wireframe") {
        gl.uniform4f(gl.getUniformLocation(curProgram, "ambient"), obj["amb"] * intensityAmb, obj["amb"] * intensityAmb, obj["amb"] * intensityAmb, 1);

        gl.uniform4f(gl.getUniformLocation(curProgram, "diffuse"), obj["diff"] * intensityLight, obj["diff"] * intensityLight, obj["diff"] * intensityLight, 1);

        gl.uniform4f(gl.getUniformLocation(curProgram, "specular"), obj["spec"] * intensityLight, obj["spec"] * intensityLight, obj["spec"] * intensityLight, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj["tBuf"]);
        gl.vertexAttribPointer(curProgram.textureCoordAttribute, obj["tBuf"].itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj["nBuf"]);
        gl.vertexAttribPointer(curProgram.normalAttribute, obj["nBuf"].itemSize, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj["iBuf"]);

    if (currentShader === "wireframe")
        gl.drawElements(gl.LINES, obj["iBuf"].numItems, gl.UNSIGNED_SHORT, 0);
    else
        gl.drawElements(gl.TRIANGLES, obj["iBuf"].numItems, gl.UNSIGNED_SHORT, 0);
}

function loadGouraudShader() {
    curProgram = gouraudProgram;
    currentShader = "gouraud";

    gl.useProgram(curProgram);

    curProgram.vertexPositionAttribute = gl.getAttribLocation(curProgram, "vPosition");
    gl.enableVertexAttribArray(curProgram.vertexPositionAttribute);

    curProgram.textureCoordAttribute = gl.getAttribLocation(curProgram, "vTexPosition");
    gl.enableVertexAttribArray(curProgram.textureCoordAttribute);

    curProgram.normalAttribute = gl.getAttribLocation(curProgram, "vNormal");
    gl.enableVertexAttribArray(curProgram.normalAttribute);

    updateMVPMatrices();

    cube["index"] = cubeIndex;
    initializeObject(cube);
    surface["index"] = surfaceIndex;
    initializeObject(surface);
}

function loadPhongShader() {
    curProgram = phongProgram;
    currentShader = "phong";

    gl.useProgram(curProgram);

    curProgram.vertexPositionAttribute = gl.getAttribLocation(curProgram, "vPosition");
    gl.enableVertexAttribArray(curProgram.vertexPositionAttribute);

    curProgram.textureCoordAttribute = gl.getAttribLocation(curProgram, "vTexPosition");
    gl.enableVertexAttribArray(curProgram.textureCoordAttribute);

    curProgram.normalAttribute = gl.getAttribLocation(curProgram, "vNormal");
    gl.enableVertexAttribArray(curProgram.normalAttribute);

    updateMVPMatrices();

    cube["index"] = cubeIndex;
    initializeObject(cube);
    surface["index"] = surfaceIndex;
    initializeObject(surface);
}

function loadWireframeShader() {
    curProgram = wireframeProgram;
    currentShader = "wireframe";

    gl.useProgram(curProgram);

    curProgram.vertexPositionAttribute = gl.getAttribLocation(curProgram, "vPosition");
    gl.enableVertexAttribArray(curProgram.vertexPositionAttribute);

    updateMVPMatrices();

    cube["index"] = cubeWireframeIndex;
    initializeObject(cube);
    surface["index"] = surfaceWireframeIndex;
    initializeObject(surface);
}

function updateMVPMatrices() {
    // Projection is changed to perspective for more realistic look
    projectionMatrix = perspective(75., (1. * canvas.clientWidth) / canvas.clientHeight, 0.01, 150);
    modelViewMatrix = lookAt(vec3(cameraPosition), vec3(), vec3(subtract(upPosition, cameraPosition)));

    gl.uniformMatrix4fv(gl.getUniformLocation(curProgram, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(curProgram, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(curProgram, "modelViewMatrix");
}