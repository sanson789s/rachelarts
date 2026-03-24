"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PORTFOLIO_DATA, PortfolioItem } from "@/data/portfolioData";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Image from "next/image";
import { withBase } from "@/lib/basePath";

const Live2DCanvasDynamic = dynamic(() => import("@/components/Live2DCanvas"), {
    ssr: false,
});



const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

import { Variants } from 'framer-motion';

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 as any } }
};

export default function PortfolioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<PortfolioItem | null>(null);

    const { scrollY } = useScroll();
    const indicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

    useEffect(() => {
        if (params.id) {
            const found = PORTFOLIO_DATA.find(p => p.id === params.id);
            if (found) {
                setProject(found);
            } else {
                router.push("/");
            }
        }
    }, [params.id, router]);

    if (!project) return null; // loading state

    const { title, sketch, baseColor, finalColor, video, themeColor, gallery } = project;

    // Define items array based on available media
    const mediaItems = [];
    if (sketch) mediaItems.push({ label: "Sketch Layer", src: sketch, type: "image", colSpan: 1 });
    if (baseColor) mediaItems.push({ label: "Base Color", src: baseColor, type: "image", colSpan: 1 });
    if (finalColor) mediaItems.push({ label: "Final Master", src: finalColor, type: "image", colSpan: 2 }); // Double width
    if (video) mediaItems.push({ label: "Live2D Rigging Showcase", src: video, type: "video", colSpan: 2 }); // Double width

    return (
        <div className="min-h-screen bg-[#050011] text-white relative overflow-hidden py-24 px-6 md:px-12 lg:px-24">
            {/* Live2D Rigged Model (Dynamic) */}
            {project.live2dPath && (
                <Live2DCanvasDynamic 
                    model3JsonPath={project.live2dPath} 
                    mode="detail" 
                />
            )}

            {/* Scroll Indicator for Live2D models */}
            {project.live2dPath && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 text-white/50 pointer-events-none"
                    style={{ opacity: indicatorOpacity }}
                >
                    <span className="text-xs font-mono uppercase tracking-widest">Scroll to explore assets</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-[1px] h-8 bg-white/30"
                    />
                </motion.div>
            )}

            {/* Hero Spacer for Live2D model - takes up full initial viewport */}
            {project.live2dPath && (
                <div className="h-[70vh] w-full pointer-events-none" />
            )}

            {/* Ambient Background Glow based on Theme Color */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] rounded-full blur-[150px] opacity-20 pointer-events-none"
                style={{ backgroundColor: themeColor }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
                >
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-light text-white/50 hover:text-white transition-colors mb-6 group"
                        >
                            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                            Return to Gallery
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase" style={{ color: themeColor }}>
                            {title}
                        </h1>
                        <p className="text-white/60 mt-4 text-lg max-w-xl font-light">
                            Deconstruction and layered breakdown of the artistic process.
                        </p>
                    </div>

                    <div className="flex h-12 items-center px-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <span className="text-sm font-medium tracking-widest uppercase opacity-70">
                            Project ID // {project.id}
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
                >
                    {mediaItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className={clsx(
                                "flex flex-col relative group",
                                item.colSpan === 2 && "md:col-span-2"
                            )}
                        >
                            {/* Layer Label */}
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-lg tracking-wider font-light uppercase border-b pb-1" style={{ borderColor: themeColor }}>
                                    {item.label}
                                </h3>
                                <span className="text-xs font-mono opacity-50">0{idx + 1}</span>
                            </div>

                            {/* Media Container */}
                            <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 aspect-video md:aspect-auto md:h-auto min-h-[300px] flex items-center justify-center p-4 group-hover:border-white/20 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

                                {item.type === "video" ? (
                                    <video
                                        src={encodeURI(withBase(item.src))}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-contain rounded-xl relative z-0 drop-shadow-2xl"
                                    />
                                ) : (
                                    <div className="relative w-full h-full min-h-[400px]">
                                        <Image
                                            src={encodeURI(item.src)}
                                            alt={item.label}
                                            fill
                                            className="object-contain rounded-xl transition-transform duration-700 group-hover:scale-[1.01] drop-shadow-2xl px-2"
                                            draggable={false}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 80vw"
                                            priority={item.label === "Final Master"}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Gallery grid for items like Emote Pack */}
                {gallery && gallery.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-16"
                    >
                        <h2 className="text-2xl font-light tracking-widest uppercase mb-8 border-b border-white/10 pb-4" style={{ color: themeColor }}>
                            Full Gallery
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {gallery.map((src, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * i, type: "spring" }}
                                    className="relative rounded-xl overflow-hidden aspect-square bg-white/5 border border-white/10 group hover:border-white/30 transition-colors"
                                >
                                    <Image
                                        src={encodeURI(src)}
                                        alt={`Gallery image ${i + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        draggable={false}
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
