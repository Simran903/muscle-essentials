import type { Metadata } from "next";
import { Geist_Mono, Michroma, Poppins } from "next/font/google";
import { Navbar } from "@/app/components/LandingPage/Navbar/Navbar";
import { ThemeFloatingToggle } from "@/app/components/LandingPage/ThemeFloatingToggle";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Toaster } from "@/app/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Muscle Essentials · API tester",
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
      className={`${poppins.variable} ${geistMono.variable} ${michroma.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          {children}
          <ThemeFloatingToggle />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
