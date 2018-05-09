// Size of bezier surface
let noControlPoints = [4, 4];
let combinations = {};
let controlPoints = [];
let noStep = 10;
let stepSize = 1. / noStep;

let surfaceVertexPos, surfaceTextPos, surfaceIndex, surfaceNormal, surfaceWireframeIndex;

function generateControlPoints() {
    controlPoints = [];
    for (let i = 0; i <= noControlPoints[0]; i++) {
        controlPoints.push([]);
        for (let j = 0; j <= noControlPoints[1]; j++)
            controlPoints[i].push(vec3(i * 3 - 1.5 * noControlPoints[0], j * 3 - 1.5 * noControlPoints[1], Math.random() * 10 - 5.));
    }
}

function generateCombinations() {
    for (let no of noControlPoints) {
        let key = no.toString();
        if (!(key in noControlPoints)) {
            combinations[key] = [];

            let currentComb = 1;
            combinations[key].push(currentComb);

            for (let i = 1; i <= no; i++) {
                currentComb *= (no - i + 1) / i;
                combinations[key].push(currentComb);
            }
        }

    }
}

function bezier(k, n, u) {
    return Math.pow(u, k) * Math.pow((1 - u), (n - k)) * combinations[n.toString()][k]
}

function duBezier(k, n, u) {
    if (k < 1 && u === 0)
        return 0.;
    return Math.pow(u, (k - 1)) * Math.pow((1 - u), (n - k - 1)) * (k * (1 - u) - u * (n - k)) * combinations[n.toString()][k];
}

function parametric(u, v) {
    let sum = vec3();

    for (let i = 0; i <= noControlPoints[0]; i++) {
        for (let j = 0; j <= noControlPoints[1]; j++) {
            for (let k = 0; k < 3; k++)
                sum[k] += controlPoints[i][j][k] * bezier(i, noControlPoints[0], v) * bezier(j, noControlPoints[1], u);
        }
    }

    return sum;
}

function duParametric(u, v) {
    let sum = vec3();

    for (let i = 0; i <= noControlPoints[0]; i++) {
        for (let j = 0; j <= noControlPoints[1]; j++) {
            for (let k = 0; k < 3; k++)
                sum[k] += controlPoints[i][j][k] * bezier(i, noControlPoints[0], v) * duBezier(j, noControlPoints[1], u);
        }
    }

    return sum;
}

function dvParametric(u, v) {
    let sum = vec3();

    for (let i = 0; i <= noControlPoints[0]; i++) {
        for (let j = 0; j <= noControlPoints[1]; j++) {
            for (let k = 0; k < 3; k++)
                sum[k] += controlPoints[i][j][k] * duBezier(i, noControlPoints[0], v) * bezier(j, noControlPoints[1], u);
        }
    }

    return sum;
}

function normal(u, v) {
    const du = duParametric(u, v), dv = dvParametric(u, v);

    return vec3(du[1] * dv[2] - dv[1] * du[2], du[2] * dv[0] - dv[2] * du[0], du[0] * dv[1] - dv[0] * du[1])
}

function runGrid() {
    surfaceVertexPos = [];
    surfaceTextPos = [];
    surfaceIndex = [];
    surfaceNormal = [];
    surfaceWireframeIndex = [];

    for (let i = 0; i <= noStep; i++) {
        for (let j = 0; j <= noStep; j++) {
            let u = i * stepSize, v = j * stepSize;
            surfaceVertexPos.push(parametric(u, v));
            surfaceTextPos.push(vec2(u, v));
            surfaceNormal.push(normal(u, v));
        }
    }

    for (let i = 0; i < noStep; i++) {
        for (let j = 0; j < noStep; j++) {
            surfaceIndex.push(i * (noStep + 1) + j);
            surfaceIndex.push(i * (noStep + 1) + j + 1);
            surfaceIndex.push((i + 1) * (noStep + 1) + j);

            surfaceIndex.push(i * (noStep + 1) + j + 1);
            surfaceIndex.push((i + 1) * (noStep + 1) + j);
            surfaceIndex.push((i + 1) * (noStep + 1) + j + 1);

            surfaceWireframeIndex.push(i * (noStep + 1) + j);
            surfaceWireframeIndex.push(i * (noStep + 1) + j + 1);
            surfaceWireframeIndex.push(i * (noStep + 1) + j + 1);
            surfaceWireframeIndex.push((i + 1) * (noStep + 1) + j + 1);
            surfaceWireframeIndex.push((i + 1) * (noStep + 1) + j + 1);
            surfaceWireframeIndex.push((i + 1) * (noStep + 1) + j);
            surfaceWireframeIndex.push((i + 1) * (noStep + 1) + j);
            surfaceWireframeIndex.push(i * (noStep + 1) + j);

        }
    }
}