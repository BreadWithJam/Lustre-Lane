import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { Header } from "@/components/navigation/Header";
import { BottomNav } from "@/components/navigation/BottomNav";

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
        <ReactQueryProvider>
          <Header />
          {/* pb-16 on mobile to clear the sticky bottom nav */}
          <div className="flex-1 flex flex-col pb-16 md:pb-0">
            {children}
          </div>
          <BottomNav />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
