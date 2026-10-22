import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Sketchbook",
  description: "A pocket sketchbook of ink-and-watercolour plates — turn the pages, pick up the glass and look closer.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
