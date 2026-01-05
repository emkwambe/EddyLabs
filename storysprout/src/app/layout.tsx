import type { Metadata } from "next";
import { Inter, Nunito, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: '--font-display',
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ['300', '400', '700'],
  variable: '--font-reading',
});

export const metadata: Metadata = {
  title: "StorySprout - Global Education Platform",
  description: "Personalized stories and educational content for ages 2-18+. Explore cultures, develop literacy, and grow through storytelling.",
  keywords: [
    "children's books",
    "educational stories",
    "personalized learning",
    "literacy development",
    "cultural education",
    "reading platform",
    "K-12 education",
    "audio books for kids",
    "interactive stories",
  ],
  authors: [{ name: "StorySprout" }],
  openGraph: {
    title: "StorySprout - Global Education Platform",
    description: "Personalized stories for ages 2-18+",
    type: "website",
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
        className={`${inter.variable} ${nunito.variable} ${merriweather.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
