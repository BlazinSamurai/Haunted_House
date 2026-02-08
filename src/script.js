import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";

/**
 * Notes:
 * - No pre-made models, only primitive shapes
 * - knowing how to master primitive is important
 * - Before adding anything, we started with a simple sphere!!!
 *  - Might be good to use the start of this project as a base for future projects!!!
 * - One unit in three.js can mean anything you want, having a specific unit ratio
 *  will help you create geometries.
 *
 *  I) Plan
 *   a) FLoor
 *    - Started w/ creating a square plane perfectly centered in the scene
 *    - "PBR" = Physically Based Rendering
 *    - Once we floor was leveled, we removed the sphere
 *    - Then we moved on the creating the house in the "groups" section
 *   b) Groups
 *    - Instantiate a house Group and add it to the scene
 *    - Create the walls(with an s) Mesh and instantiate a BoxGeometry and a
 *     MeshStandardMaterial in it
 *    - ADD IT TO THE HOUSE(NOT THE GROUP)
 *   c) Textures(LONG PROCESS!!!)
 *    - Find a good place with nice textures
 *     - He create a notion page gathering some of his favorite assests libraries
 *     - https://brunosimon.notion.site/Assets-953f65558015455eb65d38a7a5db7171
 *     - We are going to use textures from "Poly Haven"
 *     - https://polyhaven.com/textures
 *      - ONCE YOU FOUND A TEXTURE YOU LIKE, DO NOT DOWNLOAD IT RIGHT AWAY!!!
 *      - Change from "4K" to "1K" to optimize performance, WebGL only needs 1k
 *      - Download time should be a zip file
 *       - Blend = ?
 *       - Gltf = ?
 *       - unselected the these two for now
 *       - AO = Ambient Occlusion, Diffuse = Actual color, Displacement = will move
 *         the vertices us and down to create elevation, Normal = will fake the
 *         orientation to create details(DX and GL are different ways of orienting
 *         the normals and we need to go for GL), Rough = how smooth or rough the
 *         material is
 *       - For the format:
 *        - EXR = Large file size with maximum data
 *        - JPG = Small file size with potential compression artifacts
 *        - PNG = Medium file size with no compression artifacts
 *        - Normally we would use JPG for most textures and PNG for the Normal because
 *        we avoid lossy compression on normal maps to prevent visual artefacts
 *        - Since we are use grungy textures, those artefacts will be less visible
 *        - So we can use JPG for everything to optimize performance
 *    - Once downloaded, we need to:
 *    - Make sure you are allowed to use them
 *    - Download and optimize them
 *    - Apply them to the object with a different approach depending on how
 *     textures are mapped
 *    - etc ...
 *    i) Floor texture
 *     - One of the trickest/hardest
 *     - Texture is too big, so we are going to repeat, which is a Vector2 property
 *     and will control how many times the texture is repeated on each axis, a
 *     higher value means smaller texture
 *     ii) Walls texture
 *     - For downloading the wall texture, we need the same as the floor texture
 *     except for the displacement map
 *     - Once textures are added, we need to set 'colorSpace' property of the 'wallColorTexture'
 *     to 'THREE.SRGBColorSpace'
 *     iii) Roof texture
 *     - For downloading the roof texture, we need the same as the wall texture
 *     iv) Bush texture
 *     - For downloading the bush texture, we need the same as the wall texture
 *   d) Lights
 *   - Light by default are at the center of the scene
 *   - Having a dimmed AmbientLight allows the user to enjoy surfaces in the shade
 *   and mimics the light's bounce of DirectionalLight
 *    - try removing the AmbientLight to see the difference
 *   e) Ghost
 *   - created with PointLights
 *   f) Shadows
 *   - A good thing to go through each light and create a camera helper to see
 *   where the camera is and what it sees
 *    - i.e) light.shadow.camera
 *   - Shadows need to be optimized for performance
 *   - Shadows are expensive to compute
 *   g) Mapping
 *   f) sky
 *   - well talk about this in later lessons
 *   h) fog
 *   - the difference between the two is how the density is calculated
 *   - use a color picker to get the color of the bottom part of the sky
 *   i) textures optimization
 *   - textures are too big and too heavy which is bad for loading but also for
 *   the gpu
 *   - they take up more memory but they also generate a small freeze when they
 *   are being uploaded to the gpu
 *   - jpeg are good but WEBP are even better: https://caniuse.com/webp
 *    - lossy compression(image will degrade)
 *    - lossless compression(image wont degrade)
 *    - supports transparency(like png)
 *
 */

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures, STEP 3: Instantiate the Texture Loader_____________________________
 * One TextureLoader can handle all the textures of a project
 */
const textureLoader = new THREE.TextureLoader();

/**
 * House
 */
// Temporary sphere
// dont need this anymore
// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(1, 32, 32),
//   new THREE.MeshStandardMaterial({ roughness: 0.7 }),
// );
// scene.add(sphere);

/**
 * Groups, STEP 2: Creating the house_____________________________
 */
// House container
const house = new THREE.Group();
scene.add(house);

const wallColorTexture = textureLoader.load("./wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp");
const wallARMTexture = textureLoader.load("./wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp");
const wallNormalTexture = textureLoader.load("./wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp");

// Inform three.js that the wall color texture is in sRGB color space
wallColorTexture.colorSpace = THREE.SRGBColorSpace;

// Walls
// Once wall textures are added, we can add them to the "MeshStandardMaterial" below
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    aoMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    metalnessMap: wallARMTexture,
    normalMap: wallNormalTexture,
  }),
);
// walls are origin centered, so we need to move it up by half its height
walls.position.y = 1.25;
// if it is apart of the house, we add it to the house group
house.add(walls);

/**
 * Roof
 * 2.5 is the height of the walls and 0.75 is half of the roof's height because
 * the cone's origin is at its center
 */

const roofColorTexture = textureLoader.load("./roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp");
const roofARMTexture = textureLoader.load("./roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp");
const roofNormalTexture = textureLoader.load("./roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp");

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

roofColorTexture.repeat.set(4, 1);
roofARMTexture.repeat.set(4, 1);
roofNormalTexture.repeat.set(4, 1);

roofColorTexture.wrapS = THREE.RepeatWrapping;
roofARMTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1.5, 4),
  new THREE.MeshStandardMaterial({
    map: roofColorTexture,
    aoMap: roofARMTexture,
    roughnessMap: roofARMTexture,
    metalnessMap: roofARMTexture,
    normalMap: roofNormalTexture,
  }),
);
roof.rotation.y = Math.PI * 0.25;
roof.position.y = 2.5 + 0.75;
house.add(roof);

/**
 * Door
 */
const doorColorTexture = textureLoader.load("./door/color.webp");
const doorAlphaTexture = textureLoader.load("./door/alpha.webp");
const doorAmbientOcclusionTexture = textureLoader.load("./door/ambientOcclusion.webp");
const doorHeightTexture = textureLoader.load("./door/height.webp");
const doorNormalTexture = textureLoader.load("./door/normal.webp");
const doorMetalnessTexture = textureLoader.load("./door/metalness.webp");
const doorRoughnessTexture = textureLoader.load("./door/roughness.webp");

doorColorTexture.colorSpace = THREE.SRGBColorSpace;

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  // added some color to the door to check it was there
  // new THREE.MeshStandardMaterial({ color: "#aa7b7b" }),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    alphaMap: doorAlphaTexture,
    transparent: true,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.15,
    displacementBias: -0.04,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  }),
);
door.position.y = 1;
// door.position.z = 2;
// if we dont move the door a little more forward, it will be
// z-fighting with the walls
door.position.z = 2.01;
house.add(door);

/**
 * Bushes
 */

const bushColorTexture = textureLoader.load("./bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp");
const bushARMTexture = textureLoader.load("./bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp");
const bushNormalTexture = textureLoader.load("./bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp");

bushColorTexture.colorSpace = THREE.SRGBColorSpace;

bushColorTexture.repeat.set(2, 1);
bushARMTexture.repeat.set(2, 1);
bushNormalTexture.repeat.set(2, 1);

bushColorTexture.wrapS = THREE.RepeatWrapping;
bushARMTexture.wrapS = THREE.RepeatWrapping;
bushNormalTexture.wrapS = THREE.RepeatWrapping;

const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
  color: "#ccffcc",
  map: bushColorTexture,
  aoMap: bushARMTexture,
  roughnessMap: bushARMTexture,
  metalnessMap: bushARMTexture,
  normalMap: bushNormalTexture,
});

// "Mesh" creates a visible object in the scene
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
bush1.rotation.x = -0.75;

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
bush2.rotation.x = -0.75;

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);
bush3.rotation.x = -0.75;

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
bush4.rotation.x = -0.75;

house.add(bush1, bush2, bush3, bush4);

/**
 * Graves
 */

const graveColorTexture = textureLoader.load("./grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp");
const graveARMTexture = textureLoader.load("./grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp");
const graveNormalTexture = textureLoader.load("./grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp");

graveColorTexture.colorSpace = THREE.SRGBColorSpace;

// graveColorTexture.repeat.set(0.3, 0.4);
// graveARMTexture.repeat.set(0.3, 0.4);
// graveNormalTexture.repeat.set(0.3, 0.4);

// graveColorTexture.wrapS = THREE.RepeatWrapping;
// graveARMTexture.wrapS = THREE.RepeatWrapping;
// graveNormalTexture.wrapS = THREE.RepeatWrapping;

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
  map: graveColorTexture,
  aoMap: graveARMTexture,
  roughnessMap: graveARMTexture,
  metalnessMap: graveARMTexture,
  normalMap: graveNormalTexture,
});

const graves = new THREE.Group();
scene.add(graves);

// Add a classic for loop to create 30 graves
for (let i = 0; i < 30; i++) {
  // Angle
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 4;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  // Mesh
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.position.x = x;
  grave.position.y = Math.random() * 0.4;
  grave.position.z = z;
  grave.rotation.x = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;

  //Add to graves group
  graves.add(grave);
}

/**
 * Floor, STARTING POINT!_____________________________
 * - When adding our alpha floor texture, we need to set the
 *  "transparent" property of the material to true
 * - after adding our alpha map to the floor material, we can
 * add texture to the floor
 * - Then once the floor texture is added we can us them and add them here
 * using the 'map' property of the material
 */

// - using the alpha map to create some faded areas on the grass texture
// - can check that this texture is rendered by checking the network tab in dev tools
// then filter by "img" and look for "alpha.jpg" and then you should see the img
// - once confirmed it is loaded, we can apply it to the floor material below
// - can use "Figma" to create gradient images for alpha maps
const floorAlphaTexture = textureLoader.load("./floor/alpha.webp");

// after you add the alpha map texture, you can move on to adding
// texture to the floor
const floorColorTexture = textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp");
const floorARMTexture = textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp");
const floorNormalTexture = textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp");
const floorDisplacementTexture = textureLoader.load("./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp");

// since the color texture is in sRGB color space, we need to
// inform three.js about it, you only need to do this for color textures
// (diffuse/albedo/ambient occlusion/etc...) but not for
// non-color textures (normal/roughness/metalness/displacement/etc...)
floorColorTexture.colorSpace = THREE.SRGBColorSpace;

// after adding the map property, we need to fix the size of the texture
// by repeating it
floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

floorColorTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;

floorColorTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

// we use displacement map to create some elevation on the floor and rough shape
// and normal map to create more granular derails on top of the displacement map
// - to do this add two more properties to the "PlaneGeometry", and then to see
// the vertices add "wireframe: true" to the material

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20, 100, 100),
  new THREE.MeshStandardMaterial({
    // wireframe: true,
    alphaMap: floorAlphaTexture,
    transparent: true,
    map: floorColorTexture,
    aoMap: floorARMTexture,
    roughnessMap: floorARMTexture,
    metalnessMap: floorARMTexture,
    normalMap: floorNormalTexture,
    displacementMap: floorDisplacementTexture,
    displacementScale: 0.3,
    displacementBias: -0.2,
  }),
);
// Rotate the floor to be horizontal
// once added, we removed the sphere
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

gui.add(floor.material, "displacementScale").min(0).max(1).step(0.01).name("floorDispSc");
gui.add(floor.material, "displacementBias").min(-1).max(1).step(0.01).name("floorDispBias");
/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#86cdff", 0.275);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#86cdff", 1);
directionalLight.position.set(3, 2, -8);
scene.add(directionalLight);

// Door light
const doorLight = new THREE.PointLight("#ff7d46", 5);
doorLight.position.set(0, 2.2, 2.5);
house.add(doorLight);

/**
 * Ghosts
 * - by default they are all at the center of the scene under the house, SPOOKY!!!
 */
const ghost1 = new THREE.PointLight("#8800ff", 6);
const ghost2 = new THREE.PointLight("#ff0088", 6);
const ghost3 = new THREE.PointLight("#b69501", 6);
scene.add(ghost1, ghost2, ghost3);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Shadows
 */
// another Renderer??
// tells three.js that we want shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// cast and receive shadows for relevant objects
directionalLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

// we now need to go through each object and decide if it needs to
// cast shadows and/or receive shadows(ignore the graves for now)
walls.castShadow = true;
walls.receiveShadow = true;

roof.castShadow = true;
roof.receiveShadow = true;

floor.receiveShadow = true;

// cant do
// graves.castShadow = true;
// since graves was created as a group of meshes
// so we need to loop through the graves and enable shadows for each grave
for (const grave of graves.children) {
  grave.castShadow = true;
  grave.receiveShadow = true;
}

/**
 * Mapping
 * - optimize the shadow maps for each light
 */
directionalLight.shadow.mapSize.width = 256;
directionalLight.shadow.mapSize.height = 256;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.left = -8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.bottom = -8;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 10;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 10;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 10;

/**
 * Sky
 * - by default you wont be able to see anything
 */
const sky = new Sky();
sky.scale.set(100, 100, 100);
scene.add(sky);

/**
 * Fog
 */
// scene.fog = new THREE.Fog("#ff0000", 1, 13);
scene.fog = new THREE.FogExp2("#04343f", 0.1);

// to make the sky visible, we need to set some parameters
sky.material.uniforms["turbidity"].value = 10;
sky.material.uniforms["rayleigh"].value = 2;
sky.material.uniforms["mieCoefficient"].value = 0.1;
sky.material.uniforms["mieDirectionalG"].value = 0.95;
sky.material.uniforms["sunPosition"].value.set(0.3, -0.038, -0.95);

/**
 * Animate
 */
const timer = new Timer();

const tick = () => {
  // Timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Ghosts animation
  const ghost1Angle = elapsedTime * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45);

  const ghost2Angle = -elapsedTime * 0.38;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.54) * Math.sin(ghost2Angle * 1.45);

  const ghost3Angle = elapsedTime * 0.2;
  ghost3.position.x = Math.cos(ghost3Angle) * 6;
  ghost3.position.z = Math.sin(ghost3Angle) * 6;
  // ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
  // ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 3.54) * Math.sin(ghost3Angle * 2.45);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
