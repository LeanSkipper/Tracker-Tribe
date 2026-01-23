import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import TrialBanner from "@/components/TrialBanner";
import Providers from "./Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tracker & Tribe LAPIS",
  description: "Goal tracking and mastermind community platform",
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
          {/* <Navbar /> */}
          {/* <TrialBanner /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
