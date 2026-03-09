import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "NexaStore | Premium Enterprise Tech",
  description: "Advanced engineering marvels and tech gear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased bg-background-dark text-white`}
      >
        <QueryProvider>
          <div className="relative min-h-screen flex flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1 w-full mx-auto max-w-[1440px]">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
