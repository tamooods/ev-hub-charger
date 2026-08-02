import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EV Hub Charger — ค้นหาสถานีชาร์จ EV ทั่วไทย",
  description:
    "ค้นหาสถานีชาร์จรถยนต์ไฟฟ้า EV ใกล้คุณทั่วประเทศไทย กรองตามภูมิภาค แบรนด์ และกำลังชาร์จ วางแผนเส้นทางทริปของคุณได้เลย",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
