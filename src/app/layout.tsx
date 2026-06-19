import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";
import Loader from "./loading";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const geist = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.mulearn.org"),
  title: {
    default: "μLearn Dashboard",
    template: "%s | μLearn",
  },
  description:
    "μLearn is a community-driven learning platform empowering students to learn, build, and grow together.",
  keywords: [
    "mulearn",
    "learning",
    "students",
    "community",
    "technology",
    "education",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.mulearn.org",
    siteName: "μLearn",
    title: "μLearn Dashboard",
    description:
      "μLearn is a community-driven learning platform empowering students to learn, build, and grow together.",
    images: [
      { url: "/logo.webp", width: 512, height: 512, alt: "μLearn Logo" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "μLearn Dashboard",
    description:
      "μLearn is a community-driven learning platform empowering students to learn, build, and grow together.",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://app.mulearn.org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${geist.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <Providers>
            <Suspense fallback={<Loader />}>{children}</Suspense>
            <Toaster richColors position="top-right" theme="system" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
