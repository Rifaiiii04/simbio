import type { Metadata } from "next";
import { Poppins, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://simbioly.com"),
  title: {
    default: "Simbioly — Reciprocal Skill Exchange Platform (Coming Soon)",
    template: "%s | Simbioly",
  },
  description:
    "Everyone has something to teach. Everyone has something to learn. 1-on-1 reciprocal skill exchange without money. Coming soon on Web & Mobile.",
  keywords: [
    "Simbioly",
    "Skill Swap",
    "Skill Exchange",
    "Reciprocal Learning",
    "Peer Learning",
    "Barter Skills",
    "Study Buddy",
    "Simbi AI",
    "Learn Together",
    "1-on-1 Mentorship",
  ],
  authors: [{ name: "Simbioly Team" }],
  creator: "Simbioly",
  publisher: "Simbioly",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://simbioly.com",
    siteName: "Simbioly",
    title: "Simbioly — Reciprocal Skill Exchange Platform (Coming Soon)",
    description:
      "Exchange skills and knowledge 1-on-1 without spending a dime, powered by Simbi AI copilot.",
    images: [
      {
        url: "/mockup/swap-desktop.png",
        width: 1200,
        height: 630,
        alt: "Simbioly Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Simbioly — Reciprocal Skill Exchange Platform",
    description:
      "Everyone has something to teach. Everyone has something to learn. 1-on-1 skill exchange.",
    images: ["/mockup/swap-desktop.png"],
    creator: "@simbioly",
  },
  alternates: {
    canonical: "https://simbioly.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Simbioly",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, iOS, Android",
    description:
      "A 1-on-1 reciprocal skill exchange platform powered by Simbi AI copilot and transparent peer reputation.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${bricolage.variable} font-sans h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-slate-900 overflow-x-hidden selection:bg-orange-100 selection:text-[#FF6B30]">
        {children}
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
