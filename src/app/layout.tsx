import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "Rachel Arts | Your Interactive Vtuber Muse",
    description: "Commissions, streams & digital art by Rachel — your favorite Vtuber artist.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                {/* Proper mobile scaling — covers notch area on iOS */}
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                {/* Deferred after HTML parse so it never blocks first paint */}
                <Script
                    src="/live2dcubismcore.min.js"
                    strategy="afterInteractive"
                />
            </head>
            <body className={`${inter.variable} ${outfit.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
