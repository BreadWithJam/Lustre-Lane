import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { Header } from "@/components/navigation/Header";
import { BottomNav } from "@/components/navigation/BottomNav";
import { WebVitals } from "@/components/WebVitals";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Salon Microsite - Premium Hair & Beauty Services",
  description: "Discover premium hair and beauty services with our expert stylists. Browse our gallery, book appointments, and get personalized consultations.",
  keywords: ["salon", "hair", "beauty", "styling", "appointments", "consultation"],
  authors: [{ name: "Salon Microsite" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Skip to main content link for keyboard/screen reader users — Requirement 6.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-salon-brown focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ReactQueryProvider>
          <WebVitals />
          <Header />
          {/* pb-16 on mobile to clear the sticky bottom nav */}
          <div id="main-content" className="flex-1 flex flex-col pb-16 md:pb-0" tabIndex={-1}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
          <BottomNav />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
