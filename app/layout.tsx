import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CareerOS — Your career, managed like a product",
  description: "A complete career operating system for ambitious students.",
  icons: {
    icon: "/careeros-emblem.png",
    shortcut: "/careeros-emblem.png",
    apple: "/careeros-emblem.png",
  },
  openGraph: { title: "CareerOS", description: "Your career, managed like a product.", images: [{ url: "/careeros-logo.png", width: 2048, height: 768, alt: "CareerOS logo" }] },
  twitter: { card: "summary_large_image", title: "CareerOS", description: "Your career, managed like a product.", images: ["/careeros-logo.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
