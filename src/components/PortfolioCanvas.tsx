"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { useRouter } from "next/navigation";
import { withBase } from "@/lib/basePath";

// Smooth exponential lerp — feels fluid regardless of frame rate
const expLerp = (current: number, target: number, factor: number, delta: number) =>
    current + (target - current) * (1 - Math.exp(-factor * delta));

interface ProjectGroup {
    group: THREE.Group;
    baseY: number;
}

export default function PortfolioCanvas() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const isMobile = window.innerWidth <= 768;
        const canvas = canvasRef.current;

        // Disable antialias on mobile — saves GPU
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
        const maxPixelRatio = isMobile ? 1 : 1.5;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050011, 0.012);

        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xfff5ff, 0.8);
        dirLight.position.set(0, 10, 10);
        scene.add(dirLight);

        // --- Media Setup ---
        const textureLoader = new THREE.TextureLoader();
        const projectGroups: ProjectGroup[] = [];
        const allMediaMeshes: THREE.Mesh[] = [];

        const SPACING_Z = 28;
        const PLANE_W = 7;
        const PLANE_H = 10.5;

        PORTFOLIO_DATA.forEach((item, index) => {
            const projectGroup = new THREE.Group();
            const zPos = -(index * SPACING_Z);
            const xPos = (index % 2 === 0 ? 1 : -1) * 6;
            const yPos = (Math.random() - 0.5) * 3;
            projectGroup.position.set(xPos, yPos, zPos);

            const tex = textureLoader.load(encodeURI(withBase(item.finalColor)));
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false; // saves texture upload time
            const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 1.0 });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PLANE_W, PLANE_H), mat);
            mesh.userData.projectId = item.id;

            projectGroup.add(mesh);
            allMediaMeshes.push(mesh);

            const lightColor = index % 2 === 0 ? 0xff4499 : 0x44ffcc;
            const light = new THREE.PointLight(lightColor, 0, 25);
            light.position.set(0, 2, 6);
            projectGroup.add(light);
            projectGroup.userData.light = light;
            projectGroup.userData.baseY = yPos;

            scene.add(projectGroup);
            projectGroups.push({ group: projectGroup, baseY: yPos });
        });

        // --- Environmental Glass Shards ---
        const glassMat = new THREE.MeshBasicMaterial({
            color: 0xaa66ff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const shardGeo = new THREE.IcosahedronGeometry(1.5, 0);
        // Mobile: 6 shards; desktop: 20
        const shardCount = isMobile ? 6 : 20;
        for (let i = 0; i < shardCount; i++) {
            const shard = new THREE.Mesh(shardGeo, glassMat);
            shard.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * -150
            );
            shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            shard.scale.setScalar(Math.random() * 1.5 + 0.4);
            shard.userData = {
                rotSpeedX: (Math.random() - 0.5) * 0.008,
                rotSpeedY: (Math.random() - 0.5) * 0.008,
                floatOffset: Math.random() * Math.PI * 2,
                baseY: shard.position.y,
            };
            scene.add(shard);
        }

        // --- Interaction State ---
        let mouseNDC = new THREE.Vector2(0, 0);
        let targetMouseParallax = new THREE.Vector2(0, 0);
        let currentMouseParallax = new THREE.Vector2(0, 0);

        let scrollY = window.scrollY;
        let targetScrollY = scrollY;
        let currentScrollY = scrollY;
        let localIsVisible = false;

        let hoveredProjectId: string | null = null;
        const raycaster = new THREE.Raycaster();

        // Throttle raycasting — only check hover every 3 frames on desktop, skip on mobile
        let frameCount = 0;

        // Declare animId and tick BEFORE onScroll so the immediate onScroll() call
        // doesn't hit the temporal dead zone (let/const are not accessible before declaration).
        let animId: number = 0;
        let tick: () => void;

        const onPointerMove = (e: PointerEvent) => {
            mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
            targetMouseParallax.x = mouseNDC.x;
            targetMouseParallax.y = mouseNDC.y;
        };

        const onScroll = () => {
            targetScrollY = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = targetScrollY / height;
            const nowVisible = progress > 0.22 && progress < 0.78;
            if (localIsVisible !== nowVisible) {
                localIsVisible = nowVisible;
                setIsVisible(nowVisible);
                // True RAF pause: cancel/restart based on visibility
                if (nowVisible) {
                    animId = requestAnimationFrame(tick);
                } else {
                    cancelAnimationFrame(animId);
                }
            }
        };

        const onPointerDown = () => {
            if (hoveredProjectId) {
                router.push(`/portfolio/${hoveredProjectId}`);
            }
        };

        const containerEl = containerRef.current;
        containerEl.addEventListener("pointermove", onPointerMove, { passive: true });
        containerEl.addEventListener("pointerdown", onPointerDown, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });

        // Tab visibility pause
        const onVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
            } else if (localIsVisible) {
                animId = requestAnimationFrame(tick);
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        // --- Animation Loop ---
        const clock = new THREE.Clock();

        tick = () => {
            animId = requestAnimationFrame(tick);
            frameCount++;

            const delta = Math.min(clock.getDelta(), 0.05);
            const elapsed = clock.elapsedTime;

            currentScrollY = expLerp(currentScrollY, targetScrollY, 6, delta);
            currentMouseParallax.x = expLerp(currentMouseParallax.x, targetMouseParallax.x, 8, delta);
            currentMouseParallax.y = expLerp(currentMouseParallax.y, targetMouseParallax.y, 8, delta);

            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgressRaw = currentScrollY / totalHeight;
            const localProgress = Math.max(0, Math.min(1, (scrollProgressRaw - 0.25) / 0.5));
            const maxZDist = PORTFOLIO_DATA.length * SPACING_Z;

            const targetCamZ = 15 - localProgress * maxZDist;
            camera.position.z = expLerp(camera.position.z, targetCamZ, 4, delta);
            camera.position.x = expLerp(camera.position.x, currentMouseParallax.x * 4, 5, delta);
            camera.position.y = expLerp(camera.position.y, -currentMouseParallax.y * 3, 5, delta);

            // Raycasting: skip on mobile; throttle to every 3rd frame on desktop
            if (!isMobile && frameCount % 3 === 0) {
                raycaster.setFromCamera(mouseNDC, camera);
                const hits = raycaster.intersectObjects(allMediaMeshes, false);
                hoveredProjectId = hits.length > 0 ? (hits[0].object.userData.projectId as string) : null;
                if (containerRef.current) {
                    containerRef.current.style.cursor = hoveredProjectId ? "pointer" : "crosshair";
                }
            }

            projectGroups.forEach((pg, idx) => {
                const bobAmp = 0.4;
                const targetGroupY = pg.baseY + Math.sin(elapsed * 1.2 + idx * 1.1) * bobAmp;
                pg.group.position.y = expLerp(pg.group.position.y, targetGroupY, 4, delta);
                pg.group.rotation.y = expLerp(pg.group.rotation.y, currentMouseParallax.x * 0.25, 5, delta);
                pg.group.rotation.x = expLerp(pg.group.rotation.x, -currentMouseParallax.y * 0.15, 5, delta);

                const distZ = Math.abs(camera.position.z - pg.group.position.z);
                const light = pg.group.userData.light as THREE.PointLight;
                if (light) {
                    const targetIntensity = distZ < 22 ? 30 : 0;
                    light.intensity = expLerp(light.intensity, targetIntensity, 5, delta);
                }
            });

            // Shard animation — skip on mobile (few shards, save CPU)
            if (!isMobile) {
                scene.children.forEach((obj) => {
                    if (obj instanceof THREE.Mesh && obj.userData.rotSpeedX !== undefined) {
                        obj.rotation.x += obj.userData.rotSpeedX;
                        obj.rotation.y += obj.userData.rotSpeedY;
                        obj.position.y = obj.userData.baseY
                            + Math.sin(elapsed * 0.6 + obj.userData.floatOffset) * 1.5;
                    }
                });
            }

            if (localIsVisible) {
                renderer.render(scene, camera);
            }
        };

        // Call onScroll after tick is defined so the immediate invocation is safe
        onScroll();

        // If already in portfolio range on mount, start the loop immediately
        if (localIsVisible) {
            animId = requestAnimationFrame(tick);
        }

        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        return () => {
            containerEl?.removeEventListener("pointermove", onPointerMove);
            containerEl?.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            cancelAnimationFrame(animId);
            renderer.dispose();
            scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    const mat = obj.material as THREE.Material & { map?: THREE.Texture };
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                }
            });
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-10 transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
            style={{ cursor: "crosshair" }}
        >
            <canvas ref={canvasRef} className="w-full h-full" />
            {/* Subtle vignette blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270,20%,8%)/70%] via-transparent to-[hsl(270,20%,8%)/70%] pointer-events-none" />
        </div>
    );
}
