import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HemmaOS",
  description: "Ditt hem, din data, din kontroll.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0d0e12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="sv"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
