"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { withBase } from "@/lib/basePath";

export default function BackgroundCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const isMobile = window.innerWidth <= 768;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        // Cap pixel ratio: 1 on mobile, 1.5 on desktop (was 2 — saves ~44% fill-rate)
        const maxPixelRatio = isMobile ? 1 : 1.5;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const baseCameraZ = 5;
        camera.position.z = baseCameraZ;

        // --- Background Plane ---
        const textureLoader = new THREE.TextureLoader();

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform sampler2D tDiffuse;
            uniform float uTime;
            uniform float uScrollProgress;
            varying vec2 vUv;

            void main() {
                float timeXY = uTime * 0.15;
                float driftX = sin(vUv.y * 5.0 + timeXY) * 0.015 + cos(vUv.x * 3.0 + timeXY * 0.8) * 0.01;
                float driftY = cos(vUv.x * 4.0 - timeXY) * 0.015 + sin(vUv.y * 2.5 + timeXY * 1.2) * 0.01;
                
                vec2 distortedUv = vUv + vec2(driftX, driftY);
                vec4 texColor = texture2D(tDiffuse, distortedUv);
                
                vec3 darkMagenta = vec3(0.4, 0.0, 0.4);
                vec3 envyGreen = vec3(0.1, 0.8, 0.3);
                
                float gradientFactor = vUv.x + (driftX * 10.0);
                vec3 targetColor = mix(darkMagenta, envyGreen, clamp(gradientFactor, 0.0, 1.0));
                
                float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
                vec3 colorOverlay = targetColor * lum * 2.5; 
                
                vec3 finalColor = mix(texColor.rgb, colorOverlay, uScrollProgress * 0.9);

                gl_FragColor = vec4(finalColor, texColor.a);
            }
        `;

        const uniforms = {
            tDiffuse: { value: null as THREE.Texture | null },
            uTime: { value: 0 },
            uScrollProgress: { value: 0 }
        };

        const planeMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            depthWrite: false,
            transparent: true,
        });

        const geometry = new THREE.PlaneGeometry(1, 1);
        const plane = new THREE.Mesh(geometry, planeMaterial);
        scene.add(plane);

        const updatePlaneSize = () => {
            const vFov = (camera.fov * Math.PI) / 180;
            const height = 2 * Math.tan(vFov / 2) * baseCameraZ;
            const width = height * (window.innerWidth / window.innerHeight);
            plane.scale.set(width * 1.4, height * 1.4, 1);
        };
        updatePlaneSize();

        textureLoader.load(withBase('/images/Background_Art.png'), (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            // Skip mipmaps — saves ~33% of texture upload time
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            uniforms.tDiffuse.value = texture;
        });

        // --- Dust Motes / Floating Sparks ---
        // Fewer particles on mobile for better performance
        const particleCount = isMobile ? 60 : 200;
        const particlesGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 20;
            posArray[i + 1] = (Math.random() - 0.5) * 20;
            posArray[i + 2] = (Math.random() - 0.5) * 4;
            scales[i / 3] = Math.random();
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uScrollProgress: { value: 0 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uScrollProgress;
                attribute float aScale;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    pos.y += mod(uTime * 0.5 * aScale, 20.0) - 10.0; 
                    float swayAmp = 0.2 + (uScrollProgress * 0.4);
                    pos.x += sin(uTime * 0.5 + aScale * 10.0) * swayAmp;
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    float pointSize = (6.0 * aScale) + (uScrollProgress * 5.0);
                    gl_PointSize = pointSize * (15.0 / - mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                    vAlpha = smoothstep(-3.0, 1.0, mvPosition.z);
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                uniform float uScrollProgress;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    float alpha = (0.5 - dist) * 2.0;
                    vec3 baseColor = vec3(1.0, 0.9, 0.7);
                    vec3 targetColor = mix(vec3(0.8, 0.1, 0.8), vec3(0.1, 0.9, 0.4), coord.x + 0.5);
                    vec3 finalColor = mix(baseColor, targetColor, uScrollProgress * 0.7);
                    gl_FragColor = vec4(finalColor, alpha * vAlpha * 0.5);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particleSystem);

        // --- Interaction State ---
        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;
        let scrollProgress = 0, targetScrollProgress = 0;

        const onMouseMove = (event: MouseEvent) => {
            targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        const onScroll = () => {
            targetScrollProgress = Math.min(Math.max(window.scrollY / 500, 0), 1);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // --- Animation Loop with proper visibility pausing ---
        const clock = new THREE.Clock();
        let animationFrameId: number;
        let paused = false;

        const onVisibilityChange = () => {
            paused = document.hidden;
            if (!paused) {
                clock.start(); // reset clock so no time-jump on resume
                animationFrameId = requestAnimationFrame(tick);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        const tick = () => {
            if (paused) return; // truly stop RAF when tab hidden
            animationFrameId = requestAnimationFrame(tick);

            const elapsedTime = clock.getElapsedTime();

            // Pause rendering when scrolled far down (background invisible)
            if (targetScrollProgress > 0.85) return;

            uniforms.uTime.value = elapsedTime;
            particleMaterial.uniforms.uTime.value = elapsedTime;

            // Smooth lerp — frame-rate independent using exponential decay
            const dt = Math.min(clock.getDelta(), 0.05);
            const lerpAmt = 1 - Math.exp(-6 * dt);

            scrollProgress += (targetScrollProgress - scrollProgress) * lerpAmt;
            uniforms.uScrollProgress.value = scrollProgress;
            particleMaterial.uniforms.uScrollProgress.value = scrollProgress;

            mouseX += (targetMouseX - mouseX) * lerpAmt;
            mouseY += (targetMouseY - mouseY) * lerpAmt;

            camera.position.x = mouseX * 0.4;
            camera.position.y = mouseY * 0.4;
            camera.position.z = baseCameraZ - (scrollProgress * 1.5);
            camera.position.y -= scrollProgress * 0.3;

            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        };

        animationFrameId = requestAnimationFrame(tick);

        // --- Resize Handler ---
        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            updatePlaneSize();
        };
        window.addEventListener('resize', onResize);

        // --- Cleanup ---
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            cancelAnimationFrame(animationFrameId);
            plane.geometry.dispose();
            planeMaterial.dispose();
            particlesGeometry.dispose();
            particleMaterial.dispose();
            renderer.dispose();
            if (uniforms.tDiffuse.value) uniforms.tDiffuse.value.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
        />
    );
}
