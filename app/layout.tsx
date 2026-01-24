import type { Metadata } from "next";
import { Inter } from "next/font/google"; // If font issues persist, remove optimization or check usage
import Providers from "./Providers";
import "./globals.css";

// If Inter font fails in Vercel, we can try removing "subsets" or using formatted import
// For now, this usually works.
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tracker & Tribe LAPIS",
  description: "Goal tracking and mastermind community platform",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
