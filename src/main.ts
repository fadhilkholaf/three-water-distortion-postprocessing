import * as THREE from "three";

import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor("pink");
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera();
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.z = 5;

// START POSTPROCESSING

const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  }
);

const postScene = new THREE.Scene();

const postCamera = new THREE.Camera();

const postG = new THREE.PlaneGeometry(2, 2);

const postM = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    u_image_texture: { value: renderTarget.texture },
    u_time: { value: 0 },
    u_ratio: { value: window.innerWidth / window.innerHeight },
    u_img_ratio: { value: window.innerWidth / window.innerHeight },
    u_blueish: { value: 1 },
    u_scale: { value: 4 },
    u_illumination: { value: 0.3 },
    u_surface_distortion: { value: 0.07 },
    u_water_distortion: { value: 0 },
  },
});

const post = new THREE.Mesh(postG, postM);

postScene.add(post);

// END POSTPROCESSING

const videoDOM = document.createElement("video");

navigator.mediaDevices
  .getUserMedia({
    video: true,
  })
  .then((mediaStream) => {
    videoDOM.srcObject = mediaStream;
    videoDOM.onloadedmetadata = () => {
      videoDOM.setAttribute("autoplay", "true");
      videoDOM.setAttribute("playsinline", "true");
      videoDOM.play();
    };
  })
  .catch(function (err) {
    alert(err.name + ": " + err.message);
  });

const videoT = new THREE.VideoTexture(videoDOM);

const cubeG = new THREE.PlaneGeometry(4, 4);
const cubeM = new THREE.MeshBasicMaterial({ map: videoT });
const cube = new THREE.Mesh(cubeG, cubeM);

scene.add(cube);

const animate = () => {
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);

  renderer.setRenderTarget(null);
  post.material.uniforms.u_time.value = performance.now() * 2;
  renderer.render(postScene, postCamera);
};

renderer.setAnimationLoop(animate);

document.body.insertAdjacentElement("afterbegin", renderer.domElement);
