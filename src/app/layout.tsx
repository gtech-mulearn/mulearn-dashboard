import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${geistSans.variable} antialiased font-sans`}
      >
        <Providers>
          {children}
          <Toaster richColors position="top-right" theme="light" />
        </Providers>
      </body>
    </html>
  );
}
