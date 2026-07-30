import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

// Manrope: a geometric, slightly rounded grotesk — reads as precise and
// modern without tipping into "corporate SaaS" default. Used for every
// UI label, heading, and body string on the bridge.
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// JetBrains Mono: for telemetry, coordinates, tool-call payloads and any
// other readout where digits must line up — the console's "instrument" face.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SeaSafe · Bridge Console",
  description: "Decision support at the helm.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="dark bridge-backdrop text-slate-100 antialiased min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
