import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "KMG - نظام إدارة الأعمال الداخلي",
  description: "نظام إدارة المشاريع والمخزون والموارد البشرية والخزينة لشركة KMG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      dir="rtl"
      lang="ar"
      className={`${ibmPlexArabic.variable} ${jetBrainsMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-background">{children}</body>
    </html>
  );
}
