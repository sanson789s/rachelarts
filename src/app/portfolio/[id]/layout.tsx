import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { ReactNode } from "react";

export function generateStaticParams() {
    return PORTFOLIO_DATA.map((item) => ({
        id: item.id,
    }));
}

export default function PortfolioLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
