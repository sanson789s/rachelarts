"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push("/");
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'client' // Default to client. The artist will be assigned a role manually in Supabase.
                        }
                    }
                });
                if (error) throw error;
                setMessage({ text: "Success! Check your email for a confirmation link.", type: "success" });
            }
        } catch (error: any) {
            setMessage({ text: error.message || "Failed to authenticate.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ text: error.message || "Failed to authenticate with Google.", type: "error" });
        }
    };

    return (
        <div className="min-h-screen bg-[#050011] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full blur-[150px] opacity-20 pointer-events-none bg-magenta-600" style={{ backgroundColor: 'hsl(335, 90%, 68%)' }} />

            <motion.div
                className="relative z-10 w-full max-w-md rounded-3xl p-8 backdrop-blur-xl"
                style={{
                    background: "linear-gradient(135deg, rgba(30,20,40,0.8), rgba(15,10,20,0.95))",
                    border: "1px solid rgba(255,100,180,0.2)",
                    boxShadow: "0 8px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block text-2xl font-black tracking-tighter uppercase mb-2">
                        RACHEL <span className="font-light italic text-[#FF64A0]">ARTS</span>
                    </Link>
                    <p className="text-white/60 text-sm">{isLogin ? "Welcome back to the Nebula" : "Join the Pink Nebula community"}</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF64A0] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF64A0] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full py-4 rounded-xl font-bold tracking-widest uppercase text-white transition-all bg-[#FF64A0] hover:bg-[#FF82B4] shadow-[0_0_20px_rgba(255,100,160,0.4)] disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : (isLogin ? "Sign In ✦" : "Create Account ✦")}
                    </button>
                </form>

                <div className="relative my-8 flex items-center">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-4 text-xs font-bold uppercase tracking-widest text-white/30">Or continue with</span>
                    <div className="flex-1 border-t border-white/10"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-4 rounded-xl font-bold tracking-widest uppercase text-white transition-all bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-3"
                >
                    <span className="text-xl">G</span> Google
                </button>

                <div className="mt-8 text-center text-sm text-white/50">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage({ text: "", type: "" });
                        }}
                        className="ml-2 text-[#FF64A0] hover:text-[#FF82B4] font-bold uppercase tracking-wider"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
