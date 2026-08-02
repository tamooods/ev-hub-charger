import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EV Hub Charger — ค้นหาสถานีชาร์จ EV ทั่วไทย",
  description:
    "ค้นหาสถานีชาร์จรถยนต์ไฟฟ้า EV ใกล้คุณทั่วประเทศไทย กรองตามภูมิภาค แบรนด์ และกำลังชาร์จ วางแผนเส้นทางทริปของคุณได้เลย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
