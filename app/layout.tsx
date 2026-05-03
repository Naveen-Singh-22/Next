import type { Metadata } from "next";
import { Geist_Mono, Outfit, Syne } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import AppFooter from "@/components/AppFooter";

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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${syne.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=(t==="dark"||t==="light")?t:"light";var r=document.documentElement;r.setAttribute("data-theme",d);r.classList.toggle("dark",d==="dark");r.style.colorScheme=d;}catch(e){}})();`,
          }}
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
      </head>
      <body className="min-h-full flex flex-col" id="top">
        {children}
        <AppFooter />
      </body>
    </html>
  );
}

