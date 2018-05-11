/*
* Authors: Mustafa Caner Çalışkaner & Barış Poyraz
* ID's: ........ , 21401952
* CS465 Assignment 3 - Realistic Rendering Techniques on Parametric Surfaces
* Instructor: Uğur Güdükbay
* controller.js
*
* Description: The controller javascript file contains essential functions
* to control the light(ambient, specular, diffuse, intensity), to control the camera with mouse,
* to zoom in the scene, to show the options to user and to listen to events in the options,
* and to set different textures
*
 */

/*----Global variables----*/
const fps = 60.;
const mspf = 1000 / fps;

const c = document.getElementById("gl-canvas");
c.width = c.parentElement.clientWidth;
c.height = c.parentElement.clientHeight;

// Camera logic
let prevX, prevY, lastUpdate = 0;
let index = ["x", "y", "z"];

/*
* camera(event)
*
* Parameters: event
* event listens to mouse events, this function is bind to mousemove event.
*
* Description: Tracks how much mouse has been moved since last update and
* when called, this function updates the coordinates with respect to the mousemove
* event. Finally, this function calls requestAnimFrame function to change the display
*
 */
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

/*
* canvas addEventListener - mousedown, mousemove
*
* Description: Adds camera movement listeners when mouse is down,
* and calls the camera function to update the camera coordinates with the
* mousemove event
*
 */
c.addEventListener("mousedown", function (event) {
    prevX = event.clientX;
    prevY = event.clientY;

    c.addEventListener("mousemove", camera)
});

/*
* canvas removeEventListener - mousemove
*
* Description: Removes camera movement listeners when mouse is up
*
 */
function finish() {
    c.removeEventListener("mousemove", camera);
}

/*
* zoom()
*
* Description: By listening to the mousewheel, this function
* updates the camera distance to the scene, makes the necessary
* adjustments and finally calls the requestAnimFrame function
* to update display
*
 */
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
        lastUpdate = Date.now();
    }
}

/*
* canvas addEventListener - mouseup, mouseleave, mousewheel
*
* Description: Calls respective functions when the following events are occurred
*
* mouseup: finish()
* mouseleave: finish()
* mousewheel: zoom()
*
 */
c.addEventListener("mouseup", finish);
c.addEventListener("mouseleave", finish);
c.addEventListener("mousewheel", zoom);

/*
* showOptions()
*
* Description: When clicked on the Show/Hide Controls button in the executable
* HTML file, it calls this function which either shows or hide the options.
*
 */
function showOptions() {
    document.getElementById("controls").hidden = !document.getElementById("controls").hidden;
}

/*
* changeNoControlPoints()
*
* Description: This function listens for the updates to the number of control points.
* When this function is called, first it calls the generateControlPoints function to
* to create and store the control points. Second, it calls generateCombinations function to
* create a look ahead table, in order to not to calculate again. Then it sets the properties to
* the respective surface as vertex positions, texture positions, etc.
* After that it calls initializeObject function to bind buffers with these properties. At the end,
* after calling the requestAnimationFrame function, it calls addRemoveControlPoints to either increase
* or decrease the number of control points with respective to the user input
*
 */
function changeNoControlPoints() {
    noControlPoints = [parseInt(document.getElementById("noControlPointsX").value), parseInt(document.getElementById("noControlPointsY").value)];

    generateControlPoints();
    generateCombinations();
    runGrid();
    surface["vPos"] = surfaceVertexPos;
    surface["tPos"] = surfaceTextPos;
    surface["index"] = currentShader === "wireframe" ? surfaceWireframeIndex : surfaceIndex;
    surface["normal"] = surfaceNormal;
    initializeObject(surface);
    requestAnimationFrame(render);

    addRemoveControlPoints();

}

/*
* addRemoveControlPoints()
*
* Description: By listening to the change in number of control points option in the HTML
* file, this function adds or removes the control points slider. To do so, it uses the createElement
* function of the document object. It generates an explanation for the control points in the form
* of Bez(i,j) x = valueX, Bez(i,j) y = valueY, Bez(i,j) z = valueZ. Then based on the inputs it creates
* their sliders and generates the function pointer by calling the generateSliderControlFunctions function
* to update when the change happens
*
* Reference:[1]https://stackoverflow.com/questions/14853779/adding-input-elements-dynamically-to-form
*
 */
function addRemoveControlPoints() {
    let doc = document.getElementById("control_points");
    doc.innerHTML = "";
    for (let i = 0; i < noControlPoints[0]; i++) {
        for (let j = 0; j < noControlPoints[1]; j++) {
            for (let k = 0; k < 3; k++) {
                //[1]
                let text = document.createElement("p");
                text.innerHTML = "Bez(" + i + " , " + j + ") " + index[k] + " = " + 1;
                doc.appendChild(text);

                //[1]
                let input = document.createElement("input");
                input.type = "range";
                input.min = -10;
                input.max = 10;
                input.step = 0.05;
                input.value = 1;
                input.oninput = generateSliderControlFunctions(i, j, k, input, text);
                doc.appendChild(input);

                //[1]
                let br = document.createElement("BR");
                doc.appendChild(br);
            }
        }
    }

}

/*
* generateSliderControlFunctions(i, j, k, input, text)
*
* Parameters: i, j, k, input, text
* i is the X-axis
* j is the Y-axis
* k is the Z-axis
* input is slider(range) element
* text is the element that shows the description of the slider(range element)
*
* Description: This function function changes value of the controlPoints in the x, y and z axis with
* respective to the i, j, k value. It generates the explanation for the slider. Then it runs the grid
* to create the new grid and sets the new properties to the surface object. Then it calls initializeObject
* to bind buffers with these data. Finally, it calls requestAnimationFrame to update the display
*
 */
function generateSliderControlFunctions(i, j, k, input, text) {
    return function () {
        if (Date.now() - lastUpdate > mspf) {
            controlPoints[i][j][k] = parseFloat(input.value);

            text.innerHTML = "Bez(" + i + " , " + j + ") " + index[k] + " = " + input.value;

            runGrid();
            surface["vPos"] = surfaceVertexPos;
            surface["tPos"] = surfaceTextPos;
            surface["index"] = currentShader === "wireframe" ? surfaceWireframeIndex : surfaceIndex;
            surface["normal"] = surfaceNormal;
            initializeObject(surface);

            requestAnimationFrame(render);
            lastUpdate = Date.now();
        }
    }
}

/*
* changeNoStep()
*
* Description: This function listens to the change in number of steps and updates
* the step size to use the new value in the runGrid function and based on the update it sets
* the properties to the surface object and finally calls the requestAnimationFrame function to
* change the display
*
 */
function changeNoStep() {
    noStep = parseInt(document.getElementById("noStep").value);
    stepSize = 1. / noStep;

    runGrid();
    surface["vPos"] = surfaceVertexPos;
    surface["tPos"] = surfaceTextPos;
    surface["index"] = currentShader === "wireframe" ? surfaceWireframeIndex : surfaceIndex;
    surface["normal"] = surfaceNormal;
    initializeObject(surface);
    requestAnimationFrame(render);
}

/*
* updateAmbient()
*
* Description: This function is called when change happens in
* the intensity of ambient, the ambient coefficient of the cube,
* the ambient coefficient of the surface and changes the property "amb" of cube and surface.
* Finally, it updates the display by calling the requestAnimationFrame function
*
 */
function updateAmbient() {
    if (Date.now() - lastUpdate > mspf) {
        cube["amb"] = parseFloat(document.getElementById("cubeAmb").value);
        surface["amb"] = parseFloat(document.getElementById("surfaceAmb").value);
        intensityAmb = parseFloat(document.getElementById("intensityAmb").value);
        requestAnimationFrame(render);
        lastUpdate = Date.now();
    }
}

/*
* updateDiffuse()
*
* Description: This function is called when change happens in
* the diffuse coefficient of the cube and the diffuse coefficient of the surface
* and changes the property "diff" of cube and surface. Finally, it updates the
* display by calling the requestAnimationFrame function
*
 */
function updateDiffuse() {
    if (Date.now() - lastUpdate > mspf) {
        cube["diff"] = parseFloat(document.getElementById("cubeDiffuse").value);
        surface["diff"] = parseFloat(document.getElementById("surfaceDiffuse").value);
        requestAnimationFrame(render);
        lastUpdate = Date.now();
    }
}

/*
* updateSpecular()
*
* Description: This function is called when change happens in
* the specular coefficient of the cube and the specular coefficient of the surface
* and changes the property "spec" of cube and surface. Finally, it updates the
* display by calling the requestAnimationFrame function.
*
 */
function updateSpecular() {
    if (Date.now() - lastUpdate > mspf) {
        cube["spec"] = parseFloat(document.getElementById("cubeSpecular").value);
        surface["spec"] = parseFloat(document.getElementById("surfaceSpecular").value);
        requestAnimationFrame(render);
        lastUpdate = Date.now();
    }
}

/*
* updateIntensity()
*
* Description: This function is called when change occurs in ambient intensity and
* source intensity. Then this function calls requestAnimationFrame to update the display.
*
 */
function updateIntensity() {
    if (Date.now() - lastUpdate > mspf) {
        intensityLight = parseFloat(document.getElementById("intensity").value);
        requestAnimationFrame(render);
        lastUpdate = Date.now();
    }
}

/*
* setTexture(el)
*
* Parameters: el
* el is the texture that the surface is going to be changed to
*
* Description: This function changes the surface texture
*
 */
function setTexture(el) {
    activeTexture = el.innerText;
    requestAnimationFrame(render);
}
