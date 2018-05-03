//////////////////////////////////////////////////////////////////////////////
//
//  Angel.js
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Helper functions
//
function _argumentsToArray(args) {
    return [].concat.apply([], Array.prototype.slice.apply(args));
}

//----------------------------------------------------------------------------

function radians(degrees) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

function vec2() {
    const result = _argumentsToArray(arguments);

    // noinspection FallThroughInSwitchStatementJS
    switch (result.length) {
        case 0:
            result.push(0.0);
        case 1:
            result.push(0.0);
    }

    return result.splice(0, 2);
}

function vec3() {
    const result = _argumentsToArray(arguments);

    // noinspection FallThroughInSwitchStatementJS
    // noinspection FallThroughInSwitchStatementJS
    switch (result.length) {
        case 0:
            result.push(0.0);
        case 1:
            result.push(0.0);
        case 2:
            result.push(0.0);
    }

    return result.splice(0, 3);
}

function vec4() {
    const result = _argumentsToArray(arguments);

    // noinspection FallThroughInSwitchStatementJS
    // noinspection FallThroughInSwitchStatementJS
    // noinspection FallThroughInSwitchStatementJS
    switch (result.length) {
        case 0:
            result.push(0.0);
        case 1:
            result.push(0.0);
        case 2:
            result.push(0.0);
        case 3:
            result.push(1.0);
    }

    return result.splice(0, 4);
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2() {
    const v = _argumentsToArray(arguments);

    let m = [];
    // noinspection FallThroughInSwitchStatementJS
    switch (v.length) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec2(v[0], 0.0),
                vec2(0.0, v[0])
            ];
            break;

        default:
            m.push(vec2(v));
            v.splice(0, 2);
            m.push(vec2(v));
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat3() {
    const v = _argumentsToArray(arguments);

    let m = [];
    // noinspection FallThroughInSwitchStatementJS
    switch (v.length) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec3(v[0], 0.0, 0.0),
                vec3(0.0, v[0], 0.0),
                vec3(0.0, 0.0, v[0])
            ];
            break;

        default:
            m.push(vec3(v));
            v.splice(0, 3);
            m.push(vec3(v));
            v.splice(0, 3);
            m.push(vec3(v));
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat4() {
    const v = _argumentsToArray(arguments);

    let m = [];
    // noinspection FallThroughInSwitchStatementJS
    switch (v.length) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec4(v[0], 0.0, 0.0, 0.0),
                vec4(0.0, v[0], 0.0, 0.0),
                vec4(0.0, 0.0, v[0], 0.0),
                vec4(0.0, 0.0, 0.0, v[0])
            ];
            break;

        default:
            m.push(vec4(v));
            v.splice(0, 4);
            m.push(vec4(v));
            v.splice(0, 4);
            m.push(vec4(v));
            v.splice(0, 4);
            m.push(vec4(v));
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

function equal(u, v) {
    if (u.length !== v.length) {
        return false;
    }

    if (u.matrix && v.matrix) {
        for (let i = 0; i < u.length; ++i) {
            if (u[i].length !== v[i].length) {
                return false;
            }
            for (let j = 0; j < u[i].length; ++j) {
                if (u[i][j] !== v[i][j]) {
                    return false;
                }
            }
        }
    }
    else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
        return false;
    }
    else {
        for (let i = 0; i < u.length; ++i) {
            if (u[i] !== v[i]) {
                return false;
            }
        }
    }

    return true;
}

//----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
function add(u, v) {
    const result = [];

    if (u.matrix && v.matrix) {
        if (u.length !== v.length) {
            throw "add(): trying to add matrices of different dimensions";
        }

        for (let i = 0; i < u.length; ++i) {
            if (u[i].length !== v[i].length) {
                throw "add(): trying to add matrices of different dimensions";
            }
            result.push([]);
            for (let j = 0; j < u[i].length; ++j) {
                result[i].push(u[i][j] + v[i][j]);
            }
        }

        result.matrix = true;

        return result;
    }
    else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
        throw "add(): trying to add matrix and non-matrix variables";
    }
    else {
        if (u.length !== v.length) {
            throw "add(): vectors are not the same dimension";
        }

        for (let i = 0; i < u.length; ++i) {
            result.push(u[i] + v[i]);
        }

        return result;
    }
}

//----------------------------------------------------------------------------

function subtract(u, v) {
    const result = [];

    if (u.matrix && v.matrix) {
        if (u.length !== v.length) {
            throw "subtract(): trying to subtract matrices" +
            " of different dimensions";
        }

        for (let i = 0; i < u.length; ++i) {
            if (u[i].length !== v[i].length) {
                throw "subtract(): trying to subtact matrices" +
                " of different dimensions";
            }
            result.push([]);
            for (let j = 0; j < u[i].length; ++j) {
                result[i].push(u[i][j] - v[i][j]);
            }
        }

        result.matrix = true;

        return result;
    }
    else if (u.matrix && !v.matrix || !u.matrix && v.matrix) {
        throw "subtact(): trying to subtact  matrix and non-matrix variables";
    }
    else {
        if (u.length !== v.length) {
            throw "subtract(): vectors are not the same length";
        }

        for (let i = 0; i < u.length; ++i) {
            result.push(u[i] - v[i]);
        }

        return result;
    }
}

//----------------------------------------------------------------------------

function mult(u, v) {
    const result = [];

    if (u.matrix && v.matrix) {
        if (u.length !== v.length) {
            throw "mult(): trying to add matrices of different dimensions";
        }

        for (let i = 0; i < u.length; ++i) {
            if (u[i].length !== v[i].length) {
                throw "mult(): trying to add matrices of different dimensions";
            }
        }

        for (let i = 0; i < u.length; ++i) {
            result.push([]);

            for (let j = 0; j < v.length; ++j) {
                let sum = 0.0;
                for (let k = 0; k < u.length; ++k) {
                    sum += u[i][k] * v[k][j];
                }
                result[i].push(sum);
            }
        }

        result.matrix = true;

        return result;
    }
    else {
        if (u.length !== v.length) {
            throw "mult(): vectors are not the same dimension";
        }

        for (let i = 0; i < u.length; ++i) {
            result.push(u[i] * v[i]);
        }

        return result;
    }
}

//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

function translate(x, y, z) {
    if (Array.isArray(x) && x.length === 3) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    const result = mat4();
    result[0][3] = x;
    result[1][3] = y;
    result[2][3] = z;

    return result;
}

//----------------------------------------------------------------------------

function rotate(angle, axis) {
    if (!Array.isArray(axis)) {
        axis = [arguments[1], arguments[2], arguments[3]];
    }

    const v = normalize(axis);

    const x = v[0];
    const y = v[1];
    const z = v[2];

    const c = Math.cos(radians(angle));
    const omc = 1.0 - c;
    const s = Math.sin(radians(angle));

    return mat4(
        vec4(x * x * omc + c, x * y * omc - z * s, x * z * omc + y * s, 0.0),
        vec4(x * y * omc + z * s, y * y * omc + c, y * z * omc - x * s, 0.0),
        vec4(x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c, 0.0),
        vec4()
    );
}

//----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
function scale3(x, y, z) {
    if (Array.isArray(x) && x.length === 3) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    const result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;

    return result;
}

//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

// noinspection JSUnusedGlobalSymbols
// noinspection JSUnusedGlobalSymbols
function lookAt(eye, at, up) {
    if (!Array.isArray(eye) || eye.length !== 3) {
        throw "lookAt(): first parameter [eye] must be an a vec3";
    }

    if (!Array.isArray(at) || at.length !== 3) {
        throw "lookAt(): first parameter [at] must be an a vec3";
    }

    if (!Array.isArray(up) || up.length !== 3) {
        throw "lookAt(): first parameter [up] must be an a vec3";
    }

    if (equal(eye, at)) {
        return mat4();
    }

    let v = normalize(subtract(at, eye));  // view direction vector
    const n = normalize(cross(v, up));       // perpendicular vector
    const u = normalize(cross(n, v));        // "new" up vector

    v = negate(v);

    return mat4(
        vec4(n, -dot(n, eye)),
        vec4(u, -dot(u, eye)),
        vec4(v, -dot(v, eye)),
        vec4()
    );
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

// noinspection JSUnusedGlobalSymbols
function ortho(left, right, bottom, top, near, far) {
    if (left === right) {
        throw "ortho(): left and right are equal";
    }
    if (bottom === top) {
        throw "ortho(): bottom and top are equal";
    }
    if (near === far) {
        throw "ortho(): near and far are equal";
    }

    const w = right - left;
    const h = top - bottom;
    const d = far - near;

    const result = mat4();
    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;
    result[0][3] = -(left + right) / w;
    result[1][3] = -(top + bottom) / h;
    result[2][3] = -(near + far) / d;

    return result;
}

//----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
function perspective(fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(radians(fovy) / 2);
    const d = far - near;

    const result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose(m) {
    if (!m.matrix) {
        return "transpose(): trying to transpose a non-matrix";
    }

    const result = [];
    for (let i = 0; i < m.length; ++i) {
        result.push([]);
        for (let j = 0; j < m[i].length; ++j) {
            result[i].push(m[j][i]);
        }
    }

    result.matrix = true;

    return result;
}

//----------------------------------------------------------------------------
//
//  Vector Functions
//

function dot(u, v) {
    if (u.length !== v.length) {
        throw "dot(): vectors are not the same dimension";
    }

    let sum = 0.0;
    for (let i = 0; i < u.length; ++i) {
        sum += u[i] * v[i];
    }

    return sum;
}

//----------------------------------------------------------------------------

function negate(u) {
    const result = [];
    for (let i = 0; i < u.length; ++i) {
        result.push(-u[i]);
    }

    return result;
}

//----------------------------------------------------------------------------

function cross(u, v) {
    if (!Array.isArray(u) || u.length < 3) {
        throw "cross(): first argument is not a vector of at least 3";
    }

    if (!Array.isArray(v) || v.length < 3) {
        throw "cross(): second argument is not a vector of at least 3";
    }

    return [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];
}

//----------------------------------------------------------------------------

function length(u) {
    return Math.sqrt(dot(u, u));
}

//----------------------------------------------------------------------------

function normalize(u, excludeLastComponent) {
    let last;
    if (excludeLastComponent) {
        last = u.pop();
    }

    const len = length(u);

    if (!isFinite(len)) {
        throw "normalize: vector " + u + " has zero length";
    }

    for (let i = 0; i < u.length; ++i) {
        u[i] /= len;
    }

    if (excludeLastComponent) {
        u.push(last);
    }

    return u;
}

//----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
function mix(u, v, s) {
    if (typeof s !== "number") {
        throw "mix: the last paramter " + s + " must be a number";
    }

    if (u.length !== v.length) {
        throw "vector dimension mismatch";
    }

    const result = [];
    for (let i = 0; i < u.length; ++i) {
        result.push((1.0 - s) * u[i] + s * v[i]);
    }

    return result;
}

//----------------------------------------------------------------------------
//
// Vector and Matrix functions
//

// noinspection JSUnusedGlobalSymbols
function scale2(s, u) {
    if (!Array.isArray(u)) {
        throw "scale: second parameter " + u + " is not a vector";
    }

    const result = [];
    for (let i = 0; i < u.length; ++i) {
        result.push(s * u[i]);
    }

    return result;
}

//----------------------------------------------------------------------------
//
//
//

function flatten(v) {
    if (v.matrix === true) {
        v = transpose(v);
    }

    let n = v.length;
    let elemsAreArrays = false;

    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    const floats = new Float32Array(n);

    if (elemsAreArrays) {
        let idx = 0;
        for (let i = 0; i < v.length; ++i) {
            for (let j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for (let i = 0; i < v.length; ++i) {
            floats[i] = v[i];
        }
    }

    return floats;
}

//----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
const sizeof = {
    'vec2': new Float32Array(flatten(vec2())).byteLength,
    'vec3': new Float32Array(flatten(vec3())).byteLength,
    'vec4': new Float32Array(flatten(vec4())).byteLength,
    'mat2': new Float32Array(flatten(mat2())).byteLength,
    'mat3': new Float32Array(flatten(mat3())).byteLength,
    'mat4': new Float32Array(flatten(mat4())).byteLength
};
