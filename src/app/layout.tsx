import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "./styles/cross-browser.css";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Import components dynamically with client-side only rendering
const ClientLayout = dynamic(() => import('./components/ClientLayout'), { ssr: true });
const WhatsAppPopupWrapper = dynamic(() => import('./components/WhatsAppPopupWrapper'));

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avito Scent | Premium Fragrances",
  description: "Discover luxury fragrances and premium perfumes at Avito Scent.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#ffffff',
  formatDetection: {
    telephone: true,
    date: false,
    address: false,
    email: true,
    url: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body
        className={`${montserrat.variable} ${playfairDisplay.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
            <WhatsAppPopupWrapper phoneNumber="919999999999" />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
