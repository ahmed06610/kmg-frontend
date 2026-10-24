import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/client";
import { getT } from "@/lib/i18n/server";
import { getPreferences } from "@/lib/preferences";
import { directionOf } from "@/lib/preferences-shared";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("KMG - نظام إدارة الأعمال الداخلي"),
    description: t("نظام إدارة المشاريع والمخزون والموارد البشرية والخزينة لشركة KMG"),
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { theme } = await getPreferences();
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: theme === "light" ? "#f5f7fb" : "#0b0f18",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // الثيم واللغة بيتقروا من الكوكيز على السيرفر، فالصفحة بتترسم صح من أول طلب من غير وميض
  const { theme, locale } = await getPreferences();

  return (
    <html
      dir={directionOf(locale)}
      lang={locale}
      className={`${ibmPlexArabic.variable} ${jetBrainsMono.variable} h-full antialiased ${theme}`}
      style={{ colorScheme: theme }}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-background">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
