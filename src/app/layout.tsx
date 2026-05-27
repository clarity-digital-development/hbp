import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Hailey Brooke Photography | Kentucky Portrait & Lifestyle Photographer",
  description: "Professional wedding and portrait photography in Kentucky. Capturing your most precious moments with a natural, timeless style. Book your session today.",
  keywords: ["wedding photographer", "portrait photographer", "Kentucky photographer", "family photography"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://haileybrookephotography.com",
    siteName: "Hailey Brooke Photography",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main className="pt-20 lg:pt-24">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
