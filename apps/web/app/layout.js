import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import WorkspaceInitializer from "../components/WorkspaceInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Team Hub",
  description: "Team collaboration platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <WorkspaceInitializer />
        {children}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}