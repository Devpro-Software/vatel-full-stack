import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

const fontSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-app-sans",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-app-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Agents Acme Inc",
    description: "Build your AI voice agent business on our platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
        >
            <body className={`${fontSans.className} min-h-full flex flex-col`}>
                <Header />
                <main className="flex-1 bg-muted/30">{children}</main>
                <Toaster />
            </body>
        </html>
    );
}
