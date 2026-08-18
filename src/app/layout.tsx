import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const SITE_URL = "https://roomguesthouse.com";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ROOM Guest Houses | Отдых в горах Азербайджана",
  description:
    "Уютные гостевые дома в Исмаиллы. Отдых в окружении величественных гор и густых лесов. Бронирование домов, семейный отдых, романтические getaway.",
  keywords: [
    "Исмаиллы",
    "Азербайджан",
    "гостевые дома",
    "отдых в горах",
    "бронирование",
    "туризм",
    "природа",
    "Ивановка",
  ],
  authors: [{ name: "ROOM Guest Houses" }],
  icons: {
    icon: "/vacationhomelogo.png",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ROOM Guest Houses | Отдых в горах Азербайджана",
    description:
      "Уютные гостевые дома в Исмаиллы. Отдых в окружении величественных гор и густых лесов.",
    type: "website",
    url: SITE_URL,
    siteName: "ROOM Guest Houses",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROOM Guest Houses | Отдых в горах Азербайджана",
    description:
      "Уютные гостевые дома в Исмаиллы. Отдых в окружении величественных гор и густых лесов.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}