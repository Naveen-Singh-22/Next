import type { Metadata } from "next";
import { Geist_Mono, Outfit, Syne } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import SiteFooter from "./components/SiteFooter";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "thecaninehelp | Animal Rescue NGO",
  description:
    "A compassionate NGO homepage focused on rescuing, healing, and rehoming animals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${syne.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" id="top">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
