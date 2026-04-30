import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://next-hagebook.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "hagebook · a HAGE Games handbook",
    template: "%s · hagebook",
  },
  description:
    "Short, opinionated lessons on shipping web apps and games. Read, build, submit a link, get feedback.",
  keywords: [
    "hagebook",
    "HAGE Games",
    "indie games",
    "game development",
    "tutorial",
  ],
  authors: [{ name: "HAGE Games" }],
  openGraph: {
    type: "website",
    siteName: "hagebook",
    title: "hagebook · a HAGE Games handbook",
    description:
      "Read short lessons. Submit your work as a link. Get feedback.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "hagebook",
    description: "Short, opinionated lessons. Ship the thing.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="system">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow"
          >
            Skip to main content
          </a>
          <Nav />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
