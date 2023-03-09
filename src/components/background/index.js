import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const Index = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Canvas
    const canvas = document.querySelector("canvas.webgl");

    // Scene
    const scene = new THREE.Scene();

    // Fog
    const fog = new THREE.Fog("#000000", 1, 2.5);

    scene.fog = fog;

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const gridTexture = textureLoader.load("/Background/grid.png");
    const heightTexture = textureLoader.load("/Background//displace.png");
    const metalnessTexture = textureLoader.load("/Background//metal.png");

    // Plane
    const parameters = {
      displacementScale: 0.45,
      metalness: 1,
      roughness: 0.5,
    };

    const geometry = new THREE.PlaneGeometry(1.8, 2, 24, 24);
    const material = new THREE.MeshStandardMaterial({
      map: gridTexture,
      displacementMap: heightTexture,
      displacementScale: parameters.displacementScale,
      metalness: parameters.metalness,
      metalnessMap: metalnessTexture,
      roughness: parameters.roughness,
    });
    const plane = new THREE.Mesh(geometry, material);
    const plane2 = new THREE.Mesh(geometry, material);

    plane.rotation.x = -Math.PI * 0.5;
    plane2.rotation.x = -Math.PI * 0.5;

    plane.position.y = 0.0;
    plane.position.z = 0.15;
    plane2.position.y = 0.0;
    plane2.position.z = -1.85;
    scene.add(plane);
    scene.add(plane2);

    const spotlight = new THREE.SpotLight(
      "#E8FF02",
      40,
      25,
      Math.PI * 0.1,
      0.25
    );
    spotlight.position.set(0.5, 0.75, 2.1);
    spotlight.target.position.x = -0.25;
    spotlight.target.position.y = 0.25;
    spotlight.target.position.z = 0.25;
    scene.add(spotlight);
    scene.add(spotlight.target);

    const spotlight2 = new THREE.SpotLight(
      "#E8FF02",
      100,
      100,
      Math.PI * 0.1,
      0.25
    );
    spotlight2.position.set(-0.5, 0.75, 2.1);
    spotlight2.target.position.x = 0.25;
    spotlight2.target.position.y = 0.25;
    spotlight2.target.position.z = 0.25;
    scene.add(spotlight2);
    scene.add(spotlight2.target);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Base camera
    const camera = new THREE.PerspectiveCamera(
      30,
      sizes.width / sizes.height,
      0.01,
      20
    );
    camera.position.x = 0.25;
    camera.position.y = 0.15;
    camera.position.z = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-processing
    const effectComposer = new EffectComposer(renderer);
    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms["amount"].value = 0.001;

    effectComposer.addPass(rgbShiftPass);
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    effectComposer.addPass(gammaCorrectionPass);
    var bloomParams = {
      strength: 0.6,
    };
    const bloomPass = new UnrealBloomPass();
    bloomPass.strength = bloomParams.strength;
    effectComposer.addPass(bloomPass);

    // Resize handler
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

      effectComposer.setSize(sizes.width, sizes.height);
      effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Animation
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update plane position
      plane.position.z = (elapsedTime * 0.15) % 2;
      plane2.position.z = ((elapsedTime * 0.15) % 2) - 2;

      // Render
      effectComposer.render();

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }, []);

  return (
    <div>
      <main>
        <canvas ref={mountRef} className="webgl"></canvas>
      </main>
    </div>
  );
};

export default Index;
