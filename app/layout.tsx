import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["Roboto", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Tunza",
  description: "The decision before the clinic.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
