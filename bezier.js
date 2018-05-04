// Size of bezier surface
let noControlPoints = [4, 4];
let combinations = {};
let controlPoints = [];
let noStep = [100, 100];
let stepSize = [1. / noStep[0], 1. / noStep[1]];

let bezierVertexPos, bezierTextPos, bezierIndex;

for (let i = 0; i <= noControlPoints[0]; i++) {
    controlPoints.push([]);
    for (let j = 0; j <= noControlPoints[1]; j++)
        controlPoints[i].push(vec3(i * 3 - 1.5, j * 3 - 1.5, Math.random() * 10 - 5.));
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

function bez(k, n, u) {
    return Math.pow(u, k) * Math.pow((1 - u), (n - k)) * combinations[n.toString()][k]
}

function duBez(k, n, u) {
    return (Math.pow(u, (k - 1)) * Math.pow((1 - u), (n - k)) * (k * (1 - u) - u * (n - k))) * combinations[n.toString()][k]
}

function parametric(u, v) {
    let sum = vec3();

    for (let i = 0; i <= noControlPoints[0]; i++) {
        for (let j = 0; j <= noControlPoints[1]; j++) {
            for (let k = 0; k < 3; k++)
                sum[k] += controlPoints[i][j][k] * bez(i, noControlPoints[0], v) * bez(j, noControlPoints[1], u);
        }
    }

    return sum;
}

function duParametric(u, v) {
    let sum = vec3();

    for (let i = 0; i <= noControlPoints[0]; i++) {
        for (let j = 0; j <= noControlPoints[1]; j++) {
            for (let k = 0; k < 3; k++)
                sum[k] += controlPoints[i][j][k] * bez(i, noControlPoints[0], v) * duBez(j, noControlPoints[1], u);
        }
    }

    return sum;
}

function dvParametric(u, v) {
    let sum = vec3();

    for (let i = 0; i <= noControlPoints[0]; i++) {
        for (let j = 0; j <= noControlPoints[1]; j++) {
            for (let k = 0; k < 3; k++)
                sum[k] += controlPoints[i][j][k] * duBez(i, noControlPoints[0], v) * bez(j, noControlPoints[1], u);
        }
    }

    return sum;
}

function normal(u, v) {
    const du = duParametric(u, v), dv = dvParametric(u, v);

    return vec3(du[1] * dv[2] - dv[1] * du[2], du[2] * dv[0] - dv[2] * du[0], du[0] * dv[1] - dv[0] * du[1])
}

function runGrid() {
    bezierVertexPos = [];
    bezierTextPos = [];
    bezierIndex = [];

    for (let i = 0; i <= noStep[0]; i++) {
        for (let j = 0; j <= noStep[1]; j++) {
            let u = i * stepSize[0], v = j * stepSize[1];
            bezierVertexPos.push(parametric(u, v));
            bezierTextPos.push(vec2(u, v))
        }
    }

    for (let i = 0; i < noStep[0]; i++) {
        for (let j = 0; j < noStep[1]; j++) {
            bezierIndex.push(j * (noStep[0] + 1) + i);
            bezierIndex.push(j * (noStep[0] + 1) + i + 1);
            bezierIndex.push((j + 1) * (noStep[0] + 1) + i);
            bezierIndex.push(j * (noStep[0] + 1) + i + 1);
            bezierIndex.push((j + 1) * (noStep[0] + 1) + i + 1);
            bezierIndex.push((j + 1) * (noStep[0] + 1) + i);
        }
    }
}