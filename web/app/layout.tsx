import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reo le Prisme",
  description: "Simulation des discriminations à l'embauche en France",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${pixelFont.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg text-surface">
        {children}
      </body>
    </html>
  );
}
