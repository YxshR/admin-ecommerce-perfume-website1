import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Import WhatsAppButton dynamically with client-side only rendering
const ClientLayout = dynamic(() => import('./components/ClientLayout'), { ssr: true });

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

export const metadata: Metadata = {
  title: "Avito Scent | Premium Fragrances",
  description: "Discover luxury fragrances and premium perfumes at Avito Scent.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        className={`${montserrat.variable} ${playfairDisplay.variable} antialiased font-sans`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
