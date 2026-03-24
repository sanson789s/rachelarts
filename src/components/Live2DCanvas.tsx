"use client";

import { useEffect, useRef } from "react";

/**
 * Live2DCanvas - loads the Rachel Live2D model using PixiJS + pixi-live2d-display.
 * On mobile devices, skips the heavy PixiJS init and shows the static JPEG fallback instead.
 */
export default function Live2DCanvas({ 
    model3JsonPath = "/live2d/rachel/RACHEL VTUBER.model3.json",
    mode = "home"
}: { 
    model3JsonPath?: string;
    mode?: "home" | "detail";
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        let cancelled = false;

        // On mobile: skip PixiJS entirely — show static fallback image instead
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            if (imageRef.current) {
                imageRef.current.style.opacity = "1";
            }
            return;
        }

        const init = async () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Dynamically import heavy libs so they're only loaded client-side
            const PIXI = await import("pixi.js");
            const { Live2DModel } = await import("pixi-live2d-display/cubism4");

            // pixi-live2d-display needs window.PIXI
            (window as any).PIXI = PIXI;

            if (cancelled) return;

            // ---- PixiJS Application ----
            // @ts-ignore – @types/pixi.js@4 conflicts with pixi.js@7 runtime types
            const app = new PIXI.Application({
                view: canvas,
                autoStart: true,
                backgroundAlpha: 0,
                resizeTo: window,
                antialias: false, // off for performance: the model is pre-drawn
                powerPreference: "default", // avoid forcing discrete GPU / draining battery
            });

            // ---- Load Model ----
            let model: InstanceType<typeof Live2DModel> | null = null;
            try {
                model = await Live2DModel.from(
                    model3JsonPath,
                    { autoInteract: false }
                );
            } catch (err) {
                console.error("[Live2D] Failed to load model:", err);
                app.destroy(false, true);
                return;
            }

            if (cancelled || !model) {
                model?.destroy();
                app.destroy(false, true);
                return;
            }

            // @ts-ignore – PIXI 7 / pixi-live2d-display type mismatch
            app.stage.addChild(model);

            // ---- Initial Positioning & Scaling Base ----
            let baseScale = 1;
            let targetScale = 1;
            let currentScale = 1;

            let baseX = app.screen.width / 2;
            let targetX = app.screen.width / 2;
            let currentX = app.screen.width / 2;

            let targetCrouch = 0;
            let currentCrouch = 0;

            const updateBaseTransform = () => {
                if (!model) return;
                model.scale.set(1);
                const scaleX = app.screen.width / model.width;
                const scaleY = app.screen.height / model.height;
                const scaleFactor = mode === "home" ? 0.95 : 0.85;
                baseScale = Math.min(scaleX, scaleY) * scaleFactor;
                baseX = app.screen.width / 2;
                currentScale = baseScale;
                currentX = baseX;
                model.scale.set(currentScale);
                model.position.set(currentX, app.screen.height / 2);
                model.anchor.set(0.5, 0.5);
            };

            updateBaseTransform();

            // ---- Mouse / Pointer Tracking ----
            const handleMouseMove = (e: MouseEvent) => {
                if (!model) return;
                model.focus(e.clientX, e.clientY);
            };
            window.addEventListener("mousemove", handleMouseMove, { passive: true });

            // ---- Scroll Tracking ----
            const handleScroll = () => {
                const scrollY = window.scrollY;
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pageProgress = totalHeight > 0 ? scrollY / totalHeight : 0;

                let wrapperOpacity = 1;

                if (mode === "home") {
                    const crouchProgress = Math.min(Math.max(scrollY / 500, 0), 1);
                    targetCrouch = crouchProgress;
                    targetScale = baseScale * (1 + (crouchProgress * 0.25));
                    targetX = baseX - (app.screen.width * 0.20 * crouchProgress);

                    if (pageProgress >= 0.20 && pageProgress < 0.28) {
                        wrapperOpacity = 1 - ((pageProgress - 0.20) / 0.08);
                    } else if (pageProgress >= 0.28 && pageProgress < 0.70) {
                        wrapperOpacity = 0;
                    } else if (pageProgress >= 0.70 && pageProgress < 0.78) {
                        wrapperOpacity = (pageProgress - 0.70) / 0.08;
                    }
                } else {
                    wrapperOpacity = Math.max(0, 1 - (scrollY / 400));
                    const detailProgress = Math.min(scrollY / 400, 1);
                    targetScale = baseScale * (1 + (detailProgress * 0.1));
                    targetX = baseX;
                }

                if (wrapperRef.current) {
                    wrapperRef.current.style.opacity = wrapperOpacity.toString();
                    if (wrapperOpacity > 0) {
                        if (!app.ticker.started) app.ticker.start();
                    } else if (wrapperOpacity === 0) {
                        if (app.ticker.started) app.ticker.stop();
                    }
                }
            };
            window.addEventListener("scroll", handleScroll, { passive: true });
            handleScroll();

            // ---- Tab visibility pause ----
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    if (app.ticker.started) app.ticker.stop();
                } else {
                    if (!app.ticker.started) app.ticker.start();
                }
            };
            document.addEventListener("visibilitychange", handleVisibilityChange);

            // ---- Smooth Animation Ticker (Lerp) ----
            const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

            const ticker = (delta: number) => {
                if (!model) return;
                const lerpFactor = Math.min(0.05 * delta, 1.0);
                
                if (mode === "home") {
                    currentCrouch = lerp(currentCrouch, targetCrouch, lerpFactor);
                }

                currentScale = lerp(currentScale, targetScale, lerpFactor);
                currentX = lerp(currentX, targetX, lerpFactor);

                model.scale.set(currentScale);
                model.x = currentX;

                if (mode === "home") {
                    const coreModel = model.internalModel.coreModel as any;
                    if (coreModel.setParameterValueById) {
                        coreModel.setParameterValueById("ParamBodyAngleY", -10 * currentCrouch);
                        coreModel.setParameterValueById("ParamBodyAngleX", -5 * currentCrouch);
                        coreModel.setParameterValueById("ParamBodyAngleZ", -4 * currentCrouch);
                        coreModel.setParameterValueById("ParamAngleY", 25 * currentCrouch);
                        coreModel.setParameterValueById("ParamAngleZ", 10 * currentCrouch);
                        coreModel.setParameterValueById("ParamAngleX", 5 * currentCrouch);
                    }
                }
            };
            app.ticker.add(ticker);

            // ---- Intersection Observer to pause when not in view ----
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!app.ticker.started) app.ticker.start();
                    } else {
                        if (app.ticker.started) app.ticker.stop();
                    }
                });
            }, { threshold: 0.1 });

            if (wrapperRef.current) observer.observe(wrapperRef.current);

            // ---- Resize Handling ----
            const handleResize = () => {
                updateBaseTransform();
                handleScroll();
            };
            window.addEventListener("resize", handleResize);

            // ---- Cleanup ----
            cleanupRef.current = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("scroll", handleScroll);
                window.removeEventListener("resize", handleResize);
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                observer.disconnect();
                if (app && app.ticker) app.ticker.remove(ticker);
                model?.destroy();
                app.destroy(false, true);
            };
        };

        init();

        return () => {
            cancelled = true;
            cleanupRef.current?.();
            cleanupRef.current = null;
        };
    }, [model3JsonPath, mode]);

    return (
        <div
            ref={wrapperRef}
            className="fixed top-0 left-0 z-10 w-full h-full pointer-events-none transition-opacity duration-700"
        >
            {/* Live2D Canvas — hidden on mobile (isMobile check skips init) */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full hidden md:block"
                aria-hidden="true"
            />

            {/* Static Fallback — shown on mobile, hidden on desktop */}
            {mode === "home" && (
                <img
                    ref={imageRef}
                    src="/live2d/rachel/RACHEL VTUBER.jpeg"
                    alt="Rachel"
                    className="absolute w-full h-full object-contain select-none pointer-events-none md:hidden"
                    style={{
                        opacity: 1,
                        transform: "translateX(-20%) scale(1.25)",
                        objectPosition: "center bottom",
                    }}
                    aria-hidden="true"
                    draggable={false}
                />
            )}
        </div>
    );
}
