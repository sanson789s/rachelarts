"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
    id: string;
    commission_id: string;
    sender_id: string;
    content: string;
    file_url?: string;
    file_type?: string;
    created_at: string;
}

interface Commission {
    id: string;
    user_id: string;
    discord_handle: string;
    details: string;
    reference_url: string;
    status: string;
    created_at: string;
}

export default function ChatPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [isArtist, setIsArtist] = useState(false);

    // Data states
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [activeCommission, setActiveCommission] = useState<Commission | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'info' | 'success' } | null>(null);

    // Auth & Init
    useEffect(() => {
        const initChat = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/auth");
                return;
            }

            const uuid = session.user.id;
            setUserId(uuid);

            // In a real app, this role comes from the database or JWT claims.
            // For now, let's treat rachelstudio9@gmail.com as the artist.
            const artistStatus = session.user.email === "rachelstudio9@gmail.com";
            setIsArtist(artistStatus);

            // Fetch commissions
            let { data: comms, error } = await supabase
                .from('commissions')
                .select('*')
                .order('created_at', { ascending: false });

            // If not artist, mock the filter or let RLS handle it.
            // (Assuming RLS policies are set up in Supabase so artists see all, clients see their own)
            if (comms) {
                // Client side filter fallback just in case RLS isn't set up yet
                if (!artistStatus) comms = comms.filter(c => c.user_id === uuid);
                setCommissions(comms);
                if (comms.length > 0) {
                    setActiveCommission(comms[0]);
                }
            }

            setLoading(false);
        };

        // Bypass loading state for layout demo purpose when Supabase isn't connected
        const timeoutId = setTimeout(() => {
            setLoading(false);
            if (!userId) {
                setUserId("demo-user");
                setCommissions([{
                    id: "demo-comm",
                    user_id: "demo-user",
                    discord_handle: "Client#1234",
                    details: "I would like a full body rigging with 3 extra expressions please!",
                    reference_url: "",
                    status: "pending",
                    created_at: new Date().toISOString()
                }]);
            }
        }, 1500);

        initChat().catch(() => { });
        return () => clearTimeout(timeoutId);
    }, [router, userId]);

    // Fetch Messages when active commission changes
    useEffect(() => {
        if (!activeCommission) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('commission_id', activeCommission.id)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages().catch(() => { });

        // Realtime Subscription
        const channel = supabase
            .channel(`commission_${activeCommission.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `commission_id=eq.${activeCommission.id}`
            }, (payload) => {
                const newMessage = payload.new as Message;
                setMessages(prev => [...prev, newMessage]);

                // Toast if message is from the other person
                if (newMessage.sender_id !== userId) {
                    setToast({
                        message: `New message: ${newMessage.content.slice(0, 40)}${newMessage.content.length > 40 ? '...' : ''}`,
                        type: 'info'
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeCommission, userId]); // added userId to deps for toast logic check

    // Toast Timer
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Listen for new incoming commissions in Realtime
    useEffect(() => {
        if (!userId) return;

        const commChannel = supabase
            .channel('public:commissions')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'commissions'
            }, (payload) => {
                // If the user is the artist, or the user is the client who made it
                if (isArtist || payload.new.user_id === userId) {
                    setCommissions(prev => [payload.new as Commission, ...prev]);

                    // Show Notification for new commission
                    if (isArtist) {
                        setToast({ message: `New Commission Request from ${payload.new.discord_handle}!`, type: 'success' });
                        // Optional: Play sound
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(commChannel);
        };
    }, [userId, isArtist]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachedFile) || !activeCommission || !userId) return;

        const msgContent = newMessage;
        const fileToUpload = attachedFile;

        setNewMessage("");
        setAttachedFile(null);
        setIsUploading(true);

        try {
            let file_url = null;
            let file_type = null;

            if (fileToUpload) {
                const fileExt = fileToUpload.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${activeCommission.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('chat_attachments')
                    .upload(filePath, fileToUpload);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('chat_attachments').getPublicUrl(filePath);
                file_url = data.publicUrl;
                file_type = fileToUpload.type.startsWith('video/') ? 'video' : 'image';
            }

            const { data, error } = await supabase.from('messages').insert([{
                commission_id: activeCommission.id,
                sender_id: userId,
                content: msgContent,
                file_url,
                file_type
            }]).select().single();

            if (error) throw error;

        } catch (error) {
            console.error(error);
            // Revert state if we fail
            setNewMessage(msgContent);
            setAttachedFile(fileToUpload);
            alert("Failed to send message: " + (error as any).message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simple validation: check if it's an image or video
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                setAttachedFile(file);
            } else {
                alert("Please upload only images or videos.");
            }
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#050011] text-white flex items-center justify-center">Loading Communications...</div>;
    }

    return (
        <div className="flex h-screen bg-[#050011] text-white overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] rounded-full blur-[200px] opacity-10 pointer-events-none" style={{ backgroundColor: 'hsl(270, 75%, 72%)' }} />

            {/* Sidebar - Commissions List */}
            <div className="w-80 border-r border-white/10 flex flex-col relative z-10 bg-black/40 backdrop-blur-md">
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="inline-block text-xl font-black tracking-tighter uppercase mb-2">
                        RACHEL <span className="font-light italic text-[#FF64A0]">ARTS</span>
                    </Link>
                    <h2 className="text-sm font-bold tracking-widest text-white/50 uppercase mt-2">
                        {isArtist ? "Artist Dashboard" : "My Commissions"}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
                    {commissions.length === 0 ? (
                        <p className="text-white/40 text-sm p-4 text-center">No active commissions.</p>
                    ) : (
                        commissions.map((comm) => (
                            <button
                                key={comm.id}
                                onClick={() => setActiveCommission(comm)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${activeCommission?.id === comm.id ? 'bg-[#FF64A0]/20 border-[#FF64A0]/50 shadow-[0_0_15px_rgba(255,100,160,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-sm truncate">{isArtist ? comm.discord_handle : "Rachel Arts"}</h3>
                                    <div className="flex items-center gap-2">
                                        {comm.status === 'pending' && isArtist && (
                                            <span className="w-2 h-2 rounded-full bg-[#FF64A0] animate-pulse" />
                                        )}
                                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${comm.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                            {comm.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-white/50 truncate">
                                    {comm.status === 'pending' && isArtist ? "Click to review query" : comm.details}
                                </p>
                            </button>
                        ))
                    )}
                </div>

                {/* User Profile Area */}
                <div className="p-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF64A0] to-[#A050E6] flex items-center justify-center font-bold">
                        {isArtist ? "R" : "U"}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-bold truncate">{isArtist ? "Rachel (Artist)" : "Client"}</div>
                        <button
                            className="text-xs text-white/50 hover:text-white transition-colors"
                            onClick={() => { supabase.auth.signOut(); router.push("/"); }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10 bg-[url('/noise.png')] bg-repeat opacity-95">
                {activeCommission ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/60 backdrop-blur-md">
                            <div>
                                <h2 className="text-lg font-bold">{isArtist ? `Chat with ${activeCommission.discord_handle}` : "Chat with Rachel"}</h2>
                                <p className="text-xs text-white/50 tracking-widest uppercase">Commission ID: {activeCommission.id.slice(0, 8)}</p>
                            </div>
                            {activeCommission.reference_url && (
                                <a
                                    href={activeCommission.reference_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                                >
                                    <span>📸</span> View Reference
                                </a>
                            )}
                        </div>

                        {/* Messages Log */}
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
                            <AnimatePresence>
                                {/* Commission Details Initial Message */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="self-start max-w-[80%]"
                                >
                                    <div className="text-xs text-white/40 mb-1 ml-4">System • Commission Details</div>
                                    <div className="p-5 rounded-3xl rounded-tl-sm bg-white/5 border border-white/10 text-sm leading-relaxed text-white/80">
                                        {activeCommission.details}
                                    </div>
                                </motion.div>

                                {messages.map((msg, i) => {
                                    const isMe = msg.sender_id === userId;
                                    return (
                                        <motion.div
                                            key={msg.id || i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`max-w-[70%] ${isMe ? 'self-end' : 'self-start'}`}
                                        >
                                            <div className={`text-[10px] text-white/40 mb-1 mx-4 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div
                                                className={`p-4 rounded-3xl text-sm leading-relaxed shadow-lg overflow-hidden ${isMe
                                                    ? 'bg-gradient-to-br from-[#FF64A0] to-[#E65082] rounded-tr-sm text-white'
                                                    : 'bg-white/10 border border-white/10 rounded-tl-sm text-white/90'
                                                    }`}
                                            >
                                                {msg.file_url && (
                                                    <div className="mb-3 rounded-xl overflow-hidden max-w-[240px] sm:max-w-sm">
                                                        {msg.file_type === 'video' ? (
                                                            <video src={msg.file_url} controls className="w-full h-auto max-h-64 object-cover" />
                                                        ) : (
                                                            <img src={msg.file_url} alt="Attachment" className="w-full h-auto max-h-64 object-cover hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(msg.file_url, '_blank')} />
                                                        )}
                                                    </div>
                                                )}
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 bg-black/80 backdrop-blur-xl border-t border-white/10">
                            {attachedFile && (
                                <div className="mb-4 flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 w-fit">
                                    <div className="w-10 h-10 rounded bg-black/50 flex items-center justify-center text-lg hidden sm:flex">
                                        {attachedFile.type.startsWith('video/') ? '🎥' : '🖼️'}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-bold truncate text-white">{attachedFile.name}</p>
                                        <p className="text-xs text-white/50">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAttachedFile(null)}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 text-white/50 hover:text-red-400 flex items-center justify-center transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto flex items-center gap-2">
                                <label className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-lg cursor-pointer transition-colors text-white/60 hover:text-[#FF64A0]">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        disabled={isUploading}
                                    />
                                    📎
                                </label>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={isUploading ? "Uploading file..." : "Type a message to discuss your commission..."}
                                        disabled={isUploading}
                                        className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-16 py-4 text-sm text-white focus:outline-none focus:border-[#FF64A0] focus:bg-white/10 transition-colors disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !attachedFile) || isUploading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FF64A0] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isUploading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <span className="text-white transform -rotate-45 ml-1 mb-1">➤</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4 opacity-50">
                        <div className="text-6xl">💬</div>
                        <p className="font-bold tracking-widest uppercase text-sm">Select a commission to start chatting</p>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        className="fixed bottom-24 left-1/2 z-[200] px-6 py-4 rounded-2xl bg-black/80 backdrop-blur-2xl border border-[#FF64A0]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-[#FF64A0]/20 text-[#FF64A0]'}`}>
                            {toast.type === 'success' ? '✨' : '💬'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white mb-0.5">Notification</p>
                            <p className="text-xs text-white/60 leading-tight">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-white/30 hover:text-white transition-colors">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
