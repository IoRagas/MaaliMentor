import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maali Mentor — مالی مینٹر | AI Financial Coach",
  description:
    "Apni Zuban Mein, Apna Financial Future — AI-powered Urdu financial literacy coach for Pakistan. Learn budgeting, saving, investing and more in Urdu.",
  keywords: [
    "financial literacy",
    "Urdu",
    "Pakistan",
    "AI coach",
    "budgeting",
    "investing",
    "Islamic banking",
  ],
  authors: [{ name: "Maali Mentor" }],
  openGraph: {
    title: "Maali Mentor — مالی مینٹر | AI Financial Coach",
    description: "Apni Zuban Mein, Apna Financial Future",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ur" dir="ltr" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div className="gradient-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
