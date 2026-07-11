import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "UitmGetTable",
  description: "Build, view and export your UiTM class timetable — fast and free.",
  icons: [
    { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
    { rel: "icon", type: "image/x-icon", url: "/logo-v3.ico" },
  ],
  openGraph: {
    title: "UitmGetTable — UiTM Timetable Generator",
    description: "Build, view and export your UiTM class timetable — fast and free.",
    url: "https://uitmgettable.my",
    siteName: "UitmGetTable",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UitmGetTable — UiTM Timetable Generator",
    description: "Build, view and export your UiTM class timetable — fast and free.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LTZX9KYVLN"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LTZX9KYVLN');
          `}
        </Script>
        <Script 
          src="https://cloud.umami.is/script.js"
          data-website-id="5dbb2e57-b54c-4134-8675-94b2e5d537c2"
          strategy="afterInteractive"
        />

        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
