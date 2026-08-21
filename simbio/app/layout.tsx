import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import QueryProvider from "@/lib/providers/QueryProvider";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simbioly — Learn Together, Grow Together",
  description: "A skill-exchange and personal-growth platform. Learn what you want while teaching what you know.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFFEFE] text-gray-800">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
