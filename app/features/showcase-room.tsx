"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type ShowcasePoster = { id: string; title: string; image: string };

export default function ShowcaseRoom({ posters }: { posters: ShowcasePoster[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !posters.length) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setSupported(false));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07080b");
    scene.fog = new THREE.Fog("#07080b", 6, 15);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 50);
    camera.position.set(0, 0.15, 6.8);
    const gallery = new THREE.Group();
    scene.add(gallery);

    const room = new THREE.Mesh(
      new THREE.BoxGeometry(12, 6.4, 12),
      new THREE.MeshStandardMaterial({
        color: "#151820",
        roughness: 0.86,
        metalness: 0.08,
        side: THREE.BackSide,
      }),
    );
    room.position.z = 0.5;
    scene.add(room);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({ color: "#090a0d", roughness: 0.28, metalness: 0.55 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.15;
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(new THREE.AmbientLight("#8fa4ff", 1.05));
    const key = new THREE.SpotLight("#ff6673", 34, 18, Math.PI / 5, 0.6, 1.4);
    key.position.set(-4, 4.5, 5);
    key.target.position.set(0, 0, -4);
    scene.add(key, key.target);
    const fill = new THREE.PointLight("#6b83ff", 19, 13);
    fill.position.set(4, 1.5, 3);
    scene.add(fill);

    const textureLoader = new THREE.TextureLoader();
    const shown = posters.slice(0, 10);
    shown.forEach((poster, index) => {
      const column = index % 5;
      const row = Math.floor(index / 5);
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.42, 2.08, 0.13),
        new THREE.MeshStandardMaterial({
          color: index % 3 === 0 ? "#6e1d28" : "#222833",
          roughness: 0.4,
          metalness: 0.6,
        }),
      );
      frame.position.set((column - 2) * 2.05, row ? -1.28 : 1.25, -4.9);
      frame.castShadow = true;
      const texture = textureLoader.load(poster.image);
      texture.colorSpace = THREE.SRGBColorSpace;
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(1.22, 1.83),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
      );
      art.position.z = 0.071;
      frame.add(art);
      gallery.add(frame);
    });

    let yaw = 0;
    let targetYaw = 0;
    let pitch = 0;
    let targetPitch = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const down = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      targetYaw += (event.clientX - lastX) * 0.004;
      targetPitch = Math.max(-0.16, Math.min(0.16, targetPitch + (event.clientY - lastY) * 0.002));
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const up = () => {
      dragging = false;
    };
    const wheel = (event: WheelEvent) => {
      camera.position.z = Math.max(5.2, Math.min(8.8, camera.position.z + event.deltaY * 0.003));
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("wheel", wheel, { passive: true });

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    let frameId = 0;
    const render = () => {
      yaw += (targetYaw - yaw) * 0.07;
      pitch += (targetPitch - pitch) * 0.07;
      gallery.rotation.y = yaw;
      gallery.rotation.x = pitch;
      key.position.x = Math.sin(performance.now() * 0.00035) * 4;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("wheel", wheel);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [posters]);

  if (!posters.length)
    return (
      <div className="showcase-empty">
        <strong>Tu sala está esperando su primera pieza</strong>
        <p>Marca una película o serie como vista para exhibir su póster.</p>
      </div>
    );
  if (!supported)
    return (
      <div className="showcase-empty">
        <strong>Vista 3D no disponible</strong>
        <p>Tu colección sigue disponible en la galería 2D.</p>
      </div>
    );
  return (
    <div className="showcase-room">
      <div ref={hostRef} />
      <span>Arrastra para recorrer · rueda para acercarte</span>
    </div>
  );
}
