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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.performance;if(!p||typeof p.measure!=="function"||p.__patchedMeasure)return;var orig=p.measure.bind(p);p.__patchedMeasure=true;p.measure=function(){try{return orig.apply(p,arguments);}catch(e){var m=(e&&e.message)||"";var n=(e&&e.name)||"";if(m.indexOf("negative time stamp")!==-1||n==="InvalidAccessError"||n==="SyntaxError"){return;}throw e;}};}catch(_){}})();`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground [text-wrap:pretty]"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          {children}
          <div className="pb-16 md:pb-0">
            <Footer />
          </div>
          <ThemeFloatingToggle />
          <CookieConsentBar />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
