import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const poppins = Poppins({
  weight: ['400', '500', '600'], // pick the weights you need
  subsets: ['latin'],             // important
  variable: '--font-poppins',     // optional CSS variable
});
export const metadata: Metadata = {
  title: "UitmGetTable",
  description: "UiTM Timetable Generator",
 icons: "/img/logo.png", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
