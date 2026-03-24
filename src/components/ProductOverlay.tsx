"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";

interface Props {
    activeProduct: Product;
    onOpenContact: () => void;
}

export default function ProductOverlay({ activeProduct, onOpenContact }: Props) {
    const isMerch = activeProduct.id === "merch";

    return (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center md:justify-end px-4 md:px-24">
            {/* Container: full width on mobile with top padding to clear nav, right-aligned box on desktop */}
            <div className="w-full max-w-md mt-20 md:mt-0 overflow-y-auto max-h-[calc(100dvh-5rem)] md:max-h-screen">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeProduct.id}
                        initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-4 md:gap-6"
                    >
                        {/* Title & Tagline */}
                        <div>
                            <motion.h2
                                className="font-display text-4xl md:text-7xl font-bold tracking-tighter uppercase leading-tight break-words"
                                style={{
                                    color: activeProduct.accent,
                                    textShadow: `0 0 40px ${activeProduct.accent}88`,
                                }}
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                            >
                                {activeProduct.name}
                            </motion.h2>
                            <motion.p
                                className="mt-2 text-base md:text-xl font-light text-white/60"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                {activeProduct.tagline}
                            </motion.p>
                        </div>

                        {/* About Me Text — shown only for the merch/about section */}
                        {isMerch && (
                            <motion.div
                                className="pointer-events-auto rounded-2xl p-4 md:p-5 text-sm leading-relaxed text-white/75 overflow-y-auto max-h-[40vh] md:max-h-[50vh] flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40"
                                style={{
                                    background: `linear-gradient(135deg, ${activeProduct.accent}10, ${activeProduct.accent}06)`,
                                    backdropFilter: "blur(20px)",
                                    border: `1px solid ${activeProduct.accent}28`,
                                    boxShadow: `0 4px 24px ${activeProduct.accent}18`,
                                }}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.25, duration: 0.5 }}
                            >
                                <p className="italic text-white/60 text-xs text-center" style={{ color: `${activeProduct.accent}cc` }}>
                                    &quot;Art isn&apos;t just seen; it is felt in the flutter of a wing and the stroke of a brush.&quot;
                                </p>
                                <p>
                                    In the quiet space between the physical world and the digital ether, there exists the Pink Nebula—a realm of soft light and infinite imagination. Rachel is its guardian and its primary architect. Born from the stardust of forgotten sketches and the glow of a million pixels, she is a Celestial Moth Spirit who transitioned into the digital world to share the beauty of her home.
                                </p>
                                <div>
                                    <p className="font-semibold text-white/90 mb-1">🎨 The Origin of &quot;Rachel Arts&quot;</p>
                                    <p>
                                        Rachel spent eons gathering fragments of color from across the multiverse. However, she realized that these colors were meant to be shared, not just stored. She created Rachel Arts as a portal—a bridge between her mystical realm and yours. Every piece of art she crafts is a &quot;Cocoon,&quot; holding a piece of her soul until it is ready to hatch into a masterpiece for her clients and community.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white/90 mb-1">✨ Why She Vtubes?</p>
                                    <p>
                                        While she is a master of the canvas, Rachel found that the most beautiful art is the connection made with others. She took on her VTuber form to interact directly with the &quot;Inhabitants of the Solid World,&quot; using her streams to inspire fellow creators and guide them through the sometimes-shadowy forest of the creative process.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Glassmorphism Stats Card — shown for non-merch sections */}
                        {!isMerch && (
                            <motion.div
                                className="mt-4 md:mt-8 rounded-3xl p-4 md:p-6 flex flex-row flex-wrap gap-4"
                                style={{
                                    background: `linear-gradient(135deg, ${activeProduct.accent}14, ${activeProduct.accent}08)`,
                                    backdropFilter: "blur(20px)",
                                    border: `1px solid ${activeProduct.accent}30`,
                                    boxShadow: `0 8px 32px ${activeProduct.accent}20, inset 0 1px 0 ${activeProduct.accent}25`,
                                }}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                {activeProduct.stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="flex-1 min-w-[80px] border-l first:border-l-0 pl-4 md:pl-6 first:pl-0"
                                        style={{ borderColor: `${activeProduct.accent}25` }}
                                    >
                                        <div
                                            className="text-xs font-bold tracking-widest uppercase mb-1"
                                            style={{ color: `${activeProduct.accent}bb` }}
                                        >
                                            {stat.label}
                                        </div>
                                        <div className="text-xl md:text-2xl font-light text-white">
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* CTA Button */}
                        <motion.button
                            className="pointer-events-auto self-start mt-2 px-6 md:px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-white transition-all duration-300"
                            style={{
                                background: `linear-gradient(135deg, ${activeProduct.accent}cc, ${activeProduct.accent}99)`,
                                boxShadow: `0 0 30px ${activeProduct.accent}55`,
                            }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            whileHover={{ scale: 1.05, boxShadow: `0 0 50px ${activeProduct.accent}88` }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                if (activeProduct.id === "merch") {
                                    onOpenContact();
                                }
                            }}
                        >
                            {activeProduct.id === "commissions" && "Welcome ✦"}
                            {activeProduct.id === "streams" && "View Works ▶"}
                            {activeProduct.id === "merch" && "Commission Me ✦"}
                        </motion.button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
