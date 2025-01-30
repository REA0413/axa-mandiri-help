import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AXA-Mandiri-Help",
  description: "I know you were trapped into a bad investment, at least I can help you to reduce your loss",
  verification: {
    google: "A1RAIcX1hfNGRn-aqHOXd17EQnjMvEGd1GXGBlEZhas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <Toaster 
          position="top-right"
          toastOptions={{
            success: {
              duration: 6000, // 3 seconds for success
            },
            error: {
              duration: 6000, // 4 seconds for errors
            },
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
