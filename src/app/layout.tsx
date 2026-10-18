import type { Metadata } from "next";
import { Instrument_Serif, Parisienne, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { FooterGate } from "@/components/layout/FooterGate";

// Section headings and navigation, set all-caps. Self-hosted by next/font so it
// isn't blocked behind the stylesheet @import the other faces still use.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-title",
});

// Pricing pages only. Hailey designed those around a softer, more romantic
// pairing than the all-caps Instrument Serif the rest of the site uses.
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-flourish",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-reading",
});

const TITLE = "Hailey Brooke Photography | Kentucky Portrait & Lifestyle Photographer";
const DESCRIPTION =
  "Professional wedding and portrait photography in Kentucky. Capturing your most precious moments with a natural, timeless style. Book your session today.";

export const metadata: Metadata = {
  // Without metadataBase, relative Open Graph image paths never resolve to the
  // absolute URLs Facebook requires.
  metadataBase: new URL("https://haileybrookephotography.com"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["wedding photographer", "portrait photographer", "Kentucky photographer", "family photography"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://haileybrookephotography.com",
    siteName: "Hailey Brooke Photography",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og/default.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "Hailey Brooke Photography — Kentucky wedding and portrait photographer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og/default.jpg?v=2"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${parisienne.variable} ${ebGaramond.variable}`}>
      <body className="antialiased">
        <Header />
        <main className="pt-16 lg:pt-20">
          {children}
        </main>
        <FooterGate />
      </body>
    </html>
  );
}
