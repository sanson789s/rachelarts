"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface NavigationProps {
    activeProduct: Product;
    onOpenContact: () => void;
}

export default function Navigation({ activeProduct, onOpenContact }: NavigationProps) {
    const [hasSession, setHasSession] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setHasSession(!!session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setHasSession(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const sections = [
        "Home",
        "Portfolio",
        "About me",
        ...(hasSession ? ["Chat Dashboard"] : [])
    ];

    const sectionToId: Record<string, string> = {
        "Home": "commissions",
        "Portfolio": "streams",
        "About me": "merch"
    };

    const handleNavClick = (section: string) => {
        setMenuOpen(false);
        if (section === "Chat Dashboard") {
            window.location.href = "/chat";
            return;
        }
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        if (section === "Home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (section === "Portfolio") {
            window.scrollTo({ top: scrollHeight * 0.5, behavior: "smooth" });
        } else if (section === "About me") {
            window.scrollTo({ top: scrollHeight, behavior: "smooth" });
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 pointer-events-none"
            >
                {/* Logo — left-aligned */}
                <Link href="/" className="text-xl font-bold tracking-tighter uppercase cursor-pointer pointer-events-auto group text-white">
                    RACHEL{" "}
                    <span
                        className="font-light italic transition-colors"
                        style={{ color: activeProduct.accent }}
                    >
                        ARTS
                    </span>
                </Link>

                {/* Desktop section nav links */}
                <div className="hidden md:flex gap-8 items-center pointer-events-auto">
                    {sections.map((section) => {
                        const isActive = activeProduct.id === sectionToId[section];
                        return (
                            <button
                                key={section}
                                onClick={() => handleNavClick(section)}
                                className="relative cursor-pointer text-sm font-medium tracking-widest uppercase text-white outline-none"
                            >
                                <span className={isActive ? "opacity-100" : "opacity-40 hover:opacity-100 transition-opacity"}>
                                    {section}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute -bottom-2 left-0 right-0 h-0.5"
                                        style={{ backgroundColor: activeProduct.accent }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right side: CTA + hamburger */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                        className="backdrop-blur-md border px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 text-white whitespace-nowrap"
                        style={{
                            backgroundColor: `${activeProduct.accent}22`,
                            borderColor: `${activeProduct.accent}55`,
                            boxShadow: `0 0 20px ${activeProduct.accent}33`,
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${activeProduct.accent}44`;
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${activeProduct.accent}22`;
                        }}
                        onClick={onOpenContact}
                    >
                        COMMISSION ME ✦
                    </button>

                    {/* Hamburger — mobile only */}
                    <button
                        className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        <span
                            className="block w-5 h-0.5 bg-white transition-all duration-300"
                            style={{ transform: menuOpen ? "translateY(8px) rotate(45deg)" : "none" }}
                        />
                        <span
                            className="block w-5 h-0.5 bg-white transition-all duration-300"
                            style={{ opacity: menuOpen ? 0 : 1 }}
                        />
                        <span
                            className="block w-5 h-0.5 bg-white transition-all duration-300"
                            style={{ transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none" }}
                        />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile dropdown menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-16 left-0 right-0 z-40 md:hidden pointer-events-auto"
                        style={{
                            background: `linear-gradient(135deg, rgba(10,5,20,0.95), rgba(20,10,35,0.95))`,
                            backdropFilter: "blur(20px)",
                            borderBottom: `1px solid ${activeProduct.accent}30`,
                        }}
                    >
                        <div className="flex flex-col py-4">
                            {sections.map((section) => {
                                const isActive = activeProduct.id === sectionToId[section];
                                return (
                                    <button
                                        key={section}
                                        onClick={() => handleNavClick(section)}
                                        className="px-6 py-4 text-left text-sm font-medium tracking-widest uppercase text-white border-b border-white/5 last:border-0"
                                        style={{ color: isActive ? activeProduct.accent : "rgba(255,255,255,0.7)" }}
                                    >
                                        {section}
                                        {isActive && <span className="ml-2 text-xs">✦</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
