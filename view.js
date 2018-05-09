// Camera
let cameraX = 0.0, cameraY = 0.0;
let cameraDistance = 25.0;
let cameraMinDistance = 5.0;
let cameraMaxDistance = 45.0;
let cameraPosition = vec4(cameraDistance);
let upPosition = add(cameraPosition, vec4(0., 1.));

let canvas;
let gl;
let program;

let projectionMatrix;
let modelViewMatrix;
let modelViewMatrixLoc;

let intensityAmb = 0.5, intensityLight = 0.5;

// Textures are hold here to have access from multiple scripts
let textures = {};
let activeTexture = "marble";

let gouraudVS, gouraudFS;
let wireframeVS, wireframeFS;
let currentVS, currentFS;

let msg;

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

    compileShaders();
    loadWireframeShader();

    // Projection is changed to perspective for more realistic look
    projectionMatrix = perspective(75., (1. * canvas.clientWidth) / canvas.clientHeight, 0.01, 150);
    modelViewMatrix = lookAt(vec3(cameraPosition), vec3(), vec3(subtract(upPosition, cameraPosition)));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube = generateObject(cubeVertexPos, cubeTextPos, cubeWireframeIndex, cubeNormal, .5, .5, .5);
    initializeObject(cube);

    generateControlPoints();
    generateCombinations();
    runGrid();

    surface = generateObject(surfaceVertexPos, surfaceTextPos, surfaceWireframeIndex, surfaceNormal, .5, .5, .5);
    initializeObject(surface);

    render();
};

// Applies the updates in joint variables as transformations and renders the new position
function render() {
    let currentCamera = mult(mult(mat4(cameraPosition, upPosition), rotate(cameraX, 0, 1, 0)), rotate(cameraY, 0, 0, 1));

    modelViewMatrix = lookAt(vec3(currentCamera[0]), vec3(0, 0, 0), vec3(subtract(currentCamera[1], currentCamera[0])));

    if (currentCamera !== "wireframe")
        gl.uniform3fv(gl.getUniformLocation(program, "cameraPosition"), vec3(currentCamera[0]));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));

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
    gl.vertexAttribPointer(program.vertexPositionAttribute, obj["vBuf"].itemSize, gl.FLOAT, false, 0, 0);

    if (currentShader !== "wireframe") {
        gl.uniform4f(gl.getUniformLocation(program, "ambient"), obj["amb"] * intensityAmb, obj["amb"] * intensityAmb, obj["amb"] * intensityAmb, 1);

        gl.uniform4f(gl.getUniformLocation(program, "diffuse"), obj["diff"] * intensityLight, obj["diff"] * intensityLight, obj["diff"] * intensityLight, 1);

        gl.uniform4f(gl.getUniformLocation(program, "specular"), obj["spec"] * intensityLight, obj["spec"] * intensityLight, obj["spec"] * intensityLight, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj["tBuf"]);
        gl.vertexAttribPointer(program.textureCoordAttribute, obj["tBuf"].itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj["nBuf"]);
        gl.vertexAttribPointer(program.normalAttribute, obj["nBuf"].itemSize, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj["iBuf"]);

    if (currentShader === "wireframe")
        gl.drawElements(gl.LINES, obj["iBuf"].numItems, gl.UNSIGNED_SHORT, 0);
    else
        gl.drawElements(gl.TRIANGLES, obj["iBuf"].numItems, gl.UNSIGNED_SHORT, 0);
}

function loadGouraudShader() {
    if (currentVS)
        gl.detachShader(program, currentVS);
    if (currentFS)
        gl.detachShader(program, currentFS);

    currentVS = gouraudFS;
    currentFS = gouraudVS;

    gl.attachShader(program, gouraudVS);
    gl.attachShader(program, gouraudFS);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog(program) + "</pre>";
        alert(msg);
        return -1;
    }

    program.vertexPositionAttribute = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.textureCoordAttribute = gl.getAttribLocation(program, "vTexPosition");
    gl.enableVertexAttribArray(program.textureCoordAttribute);

    program.normalAttribute = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(program.normalAttribute);

    gl.uniform3fv(gl.getUniformLocation(program, "lightPosition"), new Float32Array([5, 5, 5]));

    gl.useProgram(program);

    generateTexture("kulaksız");
    generateTexture("bg");
    generateTexture("marble");
    gl.activeTexture(gl.TEXTURE0);
}

function loadWireframeShader() {
    if (currentVS)
        gl.detachShader(program, currentVS);
    if (currentFS)
        gl.detachShader(program, currentFS);

    currentVS = wireframeVS;
    currentFS = wireframeFS;

    gl.attachShader(program, wireframeVS);
    gl.attachShader(program, wireframeFS);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog(program) + "</pre>";
        alert(msg);
        return -1;
    }

    gl.useProgram(program);

    program.vertexPositionAttribute = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
}

function switchToWireframeShader() {
    currentShader = "wireframe";

    loadWireframeShader();

    cube["index"] = cubeWireframeIndex;
    surface["index"] = surfaceWireframeIndex;

    render();
}

function switchToGouraudShader() {
    currentShader = "gouraud";

    loadGouraudShader();

    cube["index"] = cubeIndex;
    surface["index"] = surfaceIndex;

    render();
}

function compileShaders() {
    let msg;

    let vertElem = document.getElementById("wireframe-vs");
    if (!vertElem) {
        alert("Unable to load vertex shader wireframe-vs");
        return -1;
    }
    else {
        wireframeVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(wireframeVS, vertElem.text);
        gl.compileShader(wireframeVS);
        if (!gl.getShaderParameter(wireframeVS, gl.COMPILE_STATUS)) {
            msg = "Vertex shader failed to compile.  The error log is:"
                + "<pre>" + gl.getShaderInfoLog(wireframeVS) + "</pre>";
            alert(msg);
            return -1;
        }
    }

    let fragElem = document.getElementById("wireframe-fs");
    if (!fragElem) {
        alert("Unable to load Fragment shader wireframe-fs");
        return -1;
    }
    else {
        wireframeFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(wireframeFS, fragElem.text);
        gl.compileShader(wireframeFS);
        if (!gl.getShaderParameter(wireframeFS, gl.COMPILE_STATUS)) {
            msg = "Fragment shader failed to compile.  The error log is:"
                + "<pre>" + gl.getShaderInfoLog(wireframeFS) + "</pre>";
            alert(msg);
            return -1;
        }
    }

    vertElem = document.getElementById("gouraud-vs");
    if (!vertElem) {
        alert("Unable to load vertex shader gouraud-vs");
        return -1;
    }
    else {
        gouraudVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(gouraudVS, vertElem.text);
        gl.compileShader(gouraudVS);
        if (!gl.getShaderParameter(gouraudVS, gl.COMPILE_STATUS)) {
            msg = "Vertex shader failed to compile.  The error log is:"
                + "<pre>" + gl.getShaderInfoLog(gouraudVS) + "</pre>";
            alert(msg);
            return -1;
        }
    }

    fragElem = document.getElementById("gouraud-fs");
    if (!fragElem) {
        alert("Unable to load Fragment shader gouraud-fs");
        return -1;
    }
    else {
        gouraudFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(gouraudFS, fragElem.text);
        gl.compileShader(gouraudFS);
        if (!gl.getShaderParameter(gouraudFS, gl.COMPILE_STATUS)) {
            msg = "Fragment shader failed to compile.  The error log is:"
                + "<pre>" + gl.getShaderInfoLog(gouraudFS) + "</pre>";
            alert(msg);
            return -1;
        }
    }

    program = gl.createProgram();
}