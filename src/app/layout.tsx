import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { Attribution } from "@/components/viewer/Attribution";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anatomy OSPE Trainer",
  description:
    "Free 3D skeletal anatomy practice for MBBS students, built for OSPE stations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#0d1117] font-sans text-zinc-200">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Attribution />
      </body>
    </html>
  );
}
