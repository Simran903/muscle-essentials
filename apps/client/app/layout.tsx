import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { CookieConsentBar } from "@/app/components/CookieConsentBar";
import { Footer } from "@/app/components/LandingPage/Footer/Footer";
import { Navbar } from "@/app/components/LandingPage/Navbar/Navbar";
import { ThemeFloatingToggle } from "@/app/components/LandingPage/ThemeFloatingToggle";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Toaster } from "@/app/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GEN1 · API tester",
  description: "Next.js UI to exercise the muscle-essentials REST API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground [text-wrap:pretty]"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
          <ThemeFloatingToggle />
          <CookieConsentBar />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
