import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  exploded: boolean;
}

export const AppEcosystemCanvas: React.FC<Props> = ({ exploded }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Central Phone Mesh
    const phoneGroup = new THREE.Group();
    const phoneGeo = new THREE.BoxGeometry(4, 8, 0.4);
    const phoneMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0a,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: 0x111111,
    });
    const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);
    phoneGroup.add(phoneMesh);

    // Phone Screen Glass Glow
    const screenGeo = new THREE.PlaneGeometry(3.7, 7.6);
    const screenMat = new THREE.MeshBasicMaterial({
      color: exploded ? 0xe50914 : 0x00d9ff,
      transparent: true,
      opacity: 0.85,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = 0.21;
    phoneGroup.add(screenMesh);

    scene.add(phoneGroup);

    // 2. Floating App Nodes Particles
    const appCount = 80;
    const appGroup = new THREE.Group();

    const colors = [0xe50914, 0x00d9ff, 0xfa7e1e, 0xd62976, 0x25d366, 0x1da1f2];
    const particleGeos = new THREE.IcosahedronGeometry(0.3, 1);

    const appParticles: { mesh: THREE.Mesh; targetPos: THREE.Vector3; initialPos: THREE.Vector3; speed: number }[] = [];

    for (let i = 0; i < appCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        wireframe: i % 2 === 0,
      });
      const mesh = new THREE.Mesh(particleGeos, mat);

      // Random position around center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 2 + Math.random() * 2;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const initialPos = new THREE.Vector3(x, y, z);

      // Target position when exploded
      const explodeRadius = 6 + Math.random() * 8;
      const targetPos = new THREE.Vector3(
        explodeRadius * Math.sin(phi) * Math.cos(theta),
        explodeRadius * Math.sin(phi) * Math.sin(theta),
        explodeRadius * Math.cos(phi)
      );

      mesh.position.copy(initialPos);
      appGroup.add(mesh);

      appParticles.push({
        mesh,
        initialPos,
        targetPos,
        speed: 0.02 + Math.random() * 0.03,
      });
    }

    scene.add(appGroup);

    // 3. Ambient Star / Particle Dust
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 600;
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 40;
      dustPositions[i + 1] = (Math.random() - 0.5) * 40;
      dustPositions[i + 2] = (Math.random() - 0.5) * 40;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xe50914, 3, 30);
    redLight.position.set(5, 5, 5);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x00d9ff, 3, 30);
    blueLight.position.set(-5, -5, 5);
    scene.add(blueLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Phone Rotation
      phoneGroup.rotation.y = elapsedTime * 0.4 + mouseX * 0.5;
      phoneGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2 + mouseY * 0.3;

      // Particle explosion interpolation
      appParticles.forEach((item) => {
        const dest = exploded ? item.targetPos : item.initialPos;
        item.mesh.position.lerp(dest, item.speed);
        item.mesh.rotation.x += 0.02;
        item.mesh.rotation.y += 0.02;
      });

      appGroup.rotation.y = elapsedTime * 0.1;
      dustPoints.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [exploded]);

  return <div ref={mountRef} className="w-full h-full absolute inset-0 pointer-events-none" />;
};
