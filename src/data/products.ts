export interface Product {
    id: string;
    name: string;
    tagline: string;
    accent: string;       // HSL string for text/borders
    glowColor: string;    // rgba string for the background glow
    stats: { label: string; value: string }[];
    scrollRange: { start: number; end: number }; // Scroll percentage range 0 to 1
}

export const PRODUCTS: Product[] = [
    {
        id: "commissions",
        name: "Home",
        tagline: "Bring your character to life.",
        accent: "hsl(335, 90%, 68%)",       // Rachel's hot pink
        glowColor: "rgba(255, 100, 160, 0.35)",
        stats: [
            { label: "Style", value: "Anime" },
            { label: "Slots", value: "Open" },
            { label: "Turnaround", value: "7 Days" },
        ],
        scrollRange: { start: 0, end: 0.33 },
    },
    {
        id: "streams",
        name: "Portfolio",
        tagline: "Join the chaos. Stay for the vibes.",
        accent: "hsl(270, 75%, 72%)",       // Rachel's purple crystal
        glowColor: "rgba(160, 80, 230, 0.35)",
        stats: [
            { label: "Platform", value: "Twitch" },
            { label: "Schedule", value: "Fri–Sun" },
            { label: "Viewers", value: "Live" },
        ],
        scrollRange: { start: 0.33, end: 0.66 },
    },
    {
        id: "merch",
        name: "About me",
        tagline: "Guardian of the Pink Nebula. Celestial Moth Spirit.",
        accent: "hsl(310, 80%, 65%)",       // Deep magenta/rose
        glowColor: "rgba(210, 50, 150, 0.35)",
        stats: [
            { label: "Items", value: "12+" },
            { label: "Ships", value: "Global" },
            { label: "Edition", value: "Limited" },
        ],
        scrollRange: { start: 0.66, end: 1 },
    },
];
