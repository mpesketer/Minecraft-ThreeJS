var scene;
var camera;
var renderer;
var controls;
const size = 10;
var matLib = { Brick: new THREE.MeshStandardMaterial(), Gold: new THREE.MeshStandardMaterial(), Water: new THREE.MeshStandardMaterial(), Ground: new THREE.MeshStandardMaterial(), Wall: new THREE.MeshStandardMaterial(), Tnt: new THREE.MeshStandardMaterial() };
var selectedMat = 'Brick';
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

function onWindowResize() {
    camera.aspect = $('#webgl').width() / $('#webgl').height();
    camera.updateProjectionMatrix();
    renderer.setSize($('#webgl').width(), $('#webgl').height());
}

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    renderer = new THREE.WebGLRenderer({ physicallyCorrectLights: true, antialias: true, powerPreference:'high-performance' });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('webgl').appendChild(renderer.domElement);
    document.addEventListener('dblclick', onDocumentMouseDown, false);
    document.addEventListener('click', onMouseDown2, false);
    window.addEventListener('resize', onWindowResize, false);
    camera.position.x = 100;
    camera.position.y = 100;
    camera.position.z = 100;
    var ambientLight = new THREE.AmbientLight(0x404040, 3);
    scene.add(ambientLight);
    controls = new THREE.PointerLockControls(camera, renderer.domElement);
    scene.add(controls.getObject());
    controls.isLocked = true;
    var onKeyDown = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if (canJump === true) velocity.y += 60;
                canJump = false;
                break;
        }
    };
    var onKeyUp = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    createDirectionalLight();

    loadMatLib();
    createMap(30, 30, 4);

    createBox('Brick', 2, 5, -8, -19, matLib.Brick, camera);
    camera.getObjectByName('Brick').rotation.y = Math.PI / 4;

    createBox('Water', 2, 2, -8, -19, matLib.Water, camera);
    camera.getObjectByName('Water').rotation.y = Math.PI / 4;

    createBox('Gold', 2, -1, -8, -19, matLib.Gold, camera);
    camera.getObjectByName('Gold').rotation.y = Math.PI / 4;

    createBox('Ground', 2, -4, -7.6, -19, matLib.Ground, camera);
    camera.getObjectByName('Ground').rotation.y = Math.PI / 4;

    createBox('Tnt', 2, -7, -8, -19, matLib.Tnt, camera);
    camera.getObjectByName('Tnt').rotation.y = Math.PI / 4;

    createBox('Wall', 2, -10, -8, -19, matLib.Wall, camera);
    camera.getObjectByName('Wall').rotation.y = Math.PI / 4;

    createBox('Empty', 2, 8, -8, -19, null, camera);
    camera.getObjectByName('Empty').rotation.y = Math.PI / 4;

    scene.add(camera);

    render();
}

function createMap(w, d, h) {
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < d; j++) {
            createBox('m_' + i + '_' + j, size, i * size, 0, j * size, matLib.Ground, scene);
        }
    }
    //for (var i = 0; i < w; i++) {
    //    for (var j = 0; j < d; j++) {
    //        const _h = Math.floor(Math.random() * (h - 2))
    //        for (var z = 1; z < _h + 2; z++) {

    //            const _t = Math.floor(Math.random() * 6)
    //            switch (_t) {
    //                case 0:
    //                    createBox('m_' + i + '_' + j, size, i * size, size * z, j * size, matLib.Brick, scene);
    //                    break;
    //                case 1:
    //                    createBox('m_' + i + '_' + j, size, i * size, size * z, j * size, matLib.Gold, scene);
    //                    break;
    //                case 2:
    //                    createBox('m_' + i + '_' + j, size, i * size, size * z, j * size, matLib.Ground, scene);
    //                    break;
    //                case 3:
    //                    createBox('m_' + i + '_' + j, size, i * size, size * z, j * size, matLib.Tnt, scene);
    //                    break;
    //                case 4:
    //                    createBox('m_' + i + '_' + j, size, i * size, size * z, j * size, matLib.Wall, scene);
    //                    break;
    //                case 5:
    //                    createBox('m_' + i + '_' + j, size, i * size, size * z, j * size, matLib.Water, scene);
    //                    break;
    //            }
    //        }
    //    }
    //}
}

function onDocumentMouseDown(event) {
    if (event.button == 0) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.layerX / $('#webgl').width()) * 2 - 1;
        mouse.y = -(event.layerY / $('#webgl').height()) * 2 + 1;
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children, false);
        if (intersects.length > 0) {
            if (selectedMat == 'Empty') {
                scene.remove(intersects[0].object);
            } else {
                if (intersects[0].faceIndex == 0 || intersects[0].faceIndex == 1) {
                    createBox('cc', size, intersects[0].object.position.x + size, intersects[0].object.position.y, intersects[0].object.position.z, matLib[selectedMat], scene);
                }
                if (intersects[0].faceIndex == 2 || intersects[0].faceIndex == 3) {
                    createBox('cc', size, intersects[0].object.position.x - size, intersects[0].object.position.y, intersects[0].object.position.z, matLib[selectedMat], scene);
                }
                if (intersects[0].faceIndex == 4 || intersects[0].faceIndex == 5) {
                    createBox('cc', size, intersects[0].object.position.x, intersects[0].object.position.y + size, intersects[0].object.position.z, matLib[selectedMat], scene);
                }
                if (intersects[0].faceIndex == 6 || intersects[0].faceIndex == 7) {
                    createBox('cc', size, intersects[0].object.position.x, intersects[0].object.position.y - size, intersects[0].object.position.z, matLib[selectedMat], scene);
                }
                if (intersects[0].faceIndex == 8 || intersects[0].faceIndex == 9) {
                    createBox('cc', size, intersects[0].object.position.x, intersects[0].object.position.y, intersects[0].object.position.z + size, matLib[selectedMat], scene);
                }
                if (intersects[0].faceIndex == 10 || intersects[0].faceIndex == 11) {
                    createBox('cc', size, intersects[0].object.position.x, intersects[0].object.position.y, intersects[0].object.position.z - size, matLib[selectedMat], scene);
                }
            }
        }
    }
}

function onMouseDown2(event) {
    if (event.button == 0) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.layerX / $('#webgl').width()) * 2 - 1;
        mouse.y = -(event.layerY / $('#webgl').height()) * 2 + 1;
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(camera.children, false);
        if (intersects.length > 0) {
            camera.getObjectByName('Brick').position.y = -8;
            camera.getObjectByName('Water').position.y = -8;
            camera.getObjectByName('Ground').position.y = -8;
            camera.getObjectByName('Wall').position.y = -8;
            camera.getObjectByName('Gold').position.y = -8;
            camera.getObjectByName('Tnt').position.y = -8;
            camera.getObjectByName('Empty').position.y = -8;

            camera.getObjectByName(intersects[0].object.name).position.y = -7.6;
            selectedMat = intersects[0].object.name;
        }
    }
}

function render() {
    renderer.render(scene, camera);

    if (controls.isLocked === true) {
        var time = performance.now();
        var delta = (time - prevTime) / 250;
        velocity.x -= velocity.x * 1.0 * delta;
        velocity.z -= velocity.z * 1.0 * delta;
        velocity.y -= 9.8 * 10.0 * delta;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        if (moveForward || moveBackward) velocity.z -= direction.z * 5.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 5.0 * delta;
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        controls.getObject().position.y += (velocity.y * delta);
        if (controls.getObject().position.y < 50) {
            velocity.y = 0;
            controls.getObject().position.y = 50;
            canJump = true;
        }
        prevTime = time;
    }

    requestAnimationFrame(render);
}
function createBox(name, size, x, y, z, texture, parent) {
    var geometry = new THREE.BoxGeometry(size, size, size);
    if (texture == null) {
        texture = new THREE.MeshStandardMaterial({ color: 0xffffff })
        texture.transparent = true;
        texture.opacity = 0.5;
    }
    var mesh = new THREE.Mesh(geometry, texture);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z);
    parent.add(mesh);
}

function loadMatLib(_lib) {
    for (var i = 0; i < _lib.length; i++) {
        var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        material.roughness = 1;
        var loader = new THREE.TextureLoader();
        material.map = loader.load('../textures/' + _lib[i] + '.jpg');
        matLib[_lib] = material;
    }
}

function loadMatLib() {
    var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    material.roughness = 1;
    var loader = new THREE.TextureLoader();
    material.map = loader.load('../textures/Brick.jpg');
    matLib.Brick = material;

    material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    material.roughness = 1;
    var loader = new THREE.TextureLoader();
    material.map = loader.load('../textures/gold.jpg');
    matLib.Gold = material;

    material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    material.roughness = 1;
    var loader = new THREE.TextureLoader();
    material.map = loader.load('../textures/Ground.jpg');
    matLib.Ground = material;

    material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    material.roughness = 1;
    var loader = new THREE.TextureLoader();
    material.map = loader.load('../textures/tnt.jpg');
    matLib.Tnt = material;

    material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    material.roughness = 1;
    var loader = new THREE.TextureLoader();
    material.map = loader.load('../textures/water.jpg');
    matLib.Water = material;

    material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    material.roughness = 1;
    var loader = new THREE.TextureLoader();
    material.map = loader.load('../textures/wall.jpg');
    matLib.Wall = material;
}
function createDirectionalLight() {
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(300, 300, -300);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.intensity = 1;

    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1000;

    scene.add(directionalLight);
}

createScene();
