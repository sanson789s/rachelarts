"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { PRODUCTS } from "@/data/products";
import Navigation from "@/components/Navigation";
import dynamic from "next/dynamic";
import ProductOverlay from "@/components/ProductOverlay";
import CommissionModal from "@/components/CommissionModal";

const BackgroundCanvasDynamic = dynamic(() => import("@/components/BackgroundCanvas"), {
    ssr: false,
});

const PortfolioCanvasDynamic = dynamic(() => import("@/components/PortfolioCanvas"), {
    ssr: false,
});

const Live2DCanvas = dynamic(() => import("@/components/Live2DCanvas"), {
    ssr: false,
});

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track scroll progress for the whole page
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [showContact, setShowContact] = useState(false);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setScrollPercentage(latest);
    });

    // Determine active product based on scroll percentage (0 to 1)
    const activeProduct = PRODUCTS.find(
        (p) => scrollPercentage >= p.scrollRange.start && scrollPercentage <= p.scrollRange.end
    ) || PRODUCTS[0];

    return (
        <div ref={containerRef} className="relative h-[400vh] w-full overflow-hidden bg-black">

            {/* Our new 3D WebGL Background */}
            <BackgroundCanvasDynamic />

            {/* The 3D Multimedia Portfolio Gallery */}
            <PortfolioCanvasDynamic />

            <Live2DCanvas />

            {/* Floating UI Elements (Top) */}
            <Navigation activeProduct={activeProduct} onOpenContact={() => setShowContact(true)} />
            <ProductOverlay activeProduct={activeProduct} onOpenContact={() => setShowContact(true)} />

            <CommissionModal isOpen={showContact} onClose={() => setShowContact(false)} />

            {/* Scroll hints */}
            <motion.div
                className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 text-white/50 pointer-events-none"
                style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
            >
                <span className="text-xs font-mono uppercase tracking-widest">Scroll down</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-[1px] h-12 bg-white/30"
                />
            </motion.div>
        </div>
    );
}
