export interface PortfolioItem {
    id: string;
    title: string;
    sketch?: string;
    baseColor?: string;
    finalColor: string;
    video?: string;
    themeColor: string;
    /** Extra images to display as a gallery on the detail page */
    gallery?: string[];
    live2dPath?: string;
}

export const PORTFOLIO_DATA: PortfolioItem[] = [
    {
        id: "sc1",
        title: "Project SC1",
        sketch: "/portfolio/SC1/SC1 Model sketch.jpg",
        baseColor: "/portfolio/SC1/SC1 Model base color.jpg",
        finalColor: "/portfolio/SC1/SC1 Model final color.jpg",
        video: "/portfolio/SC1/SC1 Model rigging.mp4",
        themeColor: "#93c5fd",
        live2dPath: "/live2d/sc1/Charlotte_.model3.json",
    },
    {
        id: "sc2",
        title: "Project SC2 — Dylan",
        sketch: "/portfolio/SC2/SC2 Model sketch.jpg",
        baseColor: "/portfolio/SC2/SC2 Model base color.jpg",
        finalColor: "/portfolio/SC2/SC2 Model final color.jpg",
        video: "/portfolio/SC2/DYLAN MODEL.mp4",
        themeColor: "#f87171",
        live2dPath: "/live2d/sc2/dylan model.model3.json",
    },
    {
        id: "sc3",
        title: "Project SC3",
        sketch: "/portfolio/SC3/SC3 Model sketch.jpg",
        baseColor: "/portfolio/SC3/SC3 Model base color.jpg",
        finalColor: "/portfolio/SC3/SC3 Model final color.jpg",
        video: "/portfolio/SC3/SC3 Model rigging.mp4",
        themeColor: "#c084fc",
    },
    {
        id: "sc4",
        title: "Project SC4",
        sketch: "/portfolio/SC4/SC4 Model Sketch .jpg",
        baseColor: "/portfolio/SC4/SC4 Model base color.jpg",
        finalColor: "/portfolio/SC4/SC4 Model final color.jpg",
        themeColor: "#4ade80",
    },
    {
        id: "sc5",
        title: "Project SC5",
        sketch: "/portfolio/SC5/SC5 Model  sketch.jpg",
        baseColor: "/portfolio/SC5/SC5 Model base color.jpg",
        finalColor: "/portfolio/SC5/SC5 Model final color.jpg",
        themeColor: "#facc15",
    },
    {
        id: "sc6",
        title: "Project SC6",
        sketch: "/portfolio/SC6/SC6 Model Sketch.jpg",
        baseColor: "/portfolio/SC6/SC6 Model base color.jpg",
        finalColor: "/portfolio/SC6/SC6 Model Final color.jpg",
        themeColor: "#f472b6",
        live2dPath: "/live2d/sc6/Yumi_Vtuber_With_Toggles_.model3.json",
    },
    {
        id: "sc7",
        title: "Project SC7 — Chibi",
        sketch: "/portfolio/SC7/SC7 Chibi Model Sketch.jpg",
        baseColor: "/portfolio/SC7/SC7 Chibi Model Base color.jpg",
        finalColor: "/portfolio/SC7/SC7 Chibi Model Base color.jpg",
        themeColor: "#fb923c",
    },
    {
        id: "collab-luna",
        title: "Collab Sheet — Luna",
        sketch: "/portfolio/collab-luna/Luna_Collab_Sheet Sketch.jpg",
        baseColor: "/portfolio/collab-luna/Luna_Collab_Sheet base color.jpg",
        finalColor: "/portfolio/collab-luna/Luna_Collab_Sheet Final color.jpg",
        themeColor: "#a5f3fc",
    },
    {
        id: "collab-sponge",
        title: "Collab Sheet — Sponge",
        sketch: "/portfolio/collab-sponge/Sponge_Collab_Sheet Sketch.jpg",
        baseColor: "/portfolio/collab-sponge/Sponge_Collab_Sheet base color.jpg",
        finalColor: "/portfolio/collab-sponge/Sponge_Collab_Sheet final color.jpg",
        themeColor: "#86efac",
    },
    {
        id: "streaming-schedule",
        title: "Streaming Schedule",
        finalColor: "/portfolio/streaming-schedule/Streaming Schedule final color.jpg",
        video: "/portfolio/streaming-schedule/Streaming Schedule Animation.mp4",
        themeColor: "#818cf8",
    },
    {
        id: "emotes",
        title: "Emote Pack",
        finalColor: "/portfolio/emotes/WhatsApp Image 2025-10-19 at 23.19.54_8bb2f3f1.jpg",
        gallery: [
            "/portfolio/emotes/WhatsApp Image 2025-10-19 at 23.19.54_8bb2f3f1.jpg",
            "/portfolio/emotes/WhatsApp Image 2025-10-19 at 23.19.54_af10dc52.jpg",
            "/portfolio/emotes/WhatsApp Image 2025-10-19 at 23.19.55_a1270c93.jpg",
            "/portfolio/emotes/WhatsApp Image 2025-11-21 at 10.12.09_3bc86f26.jpg",
        ],
        themeColor: "#f9a8d4",
    },
    {
        id: "vtuber-package",
        title: "Vtuber Package Series 1",
        baseColor: "/portfolio/vtuber-package/SC2 model emotes sketch.jpg",
        finalColor: "/portfolio/vtuber-package/SC2 model Overlay.jpg",
        video: "/portfolio/vtuber-package/INTRO.mp4",
        themeColor: "#fbbf24",
    },
];
