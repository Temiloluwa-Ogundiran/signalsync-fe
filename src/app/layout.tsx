import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SignalSync",
    template: "%s | SignalSync",
  },
  description:
    "An AI coach that reviews every trade — journal, tag, and improve with systematic confidence.",
  icons: {
    icon: "/brand/signalsync-mark.svg",
    apple: "/brand/signalsync-mark.svg",
  },
};

// viewport-fit=cover lets env(safe-area-inset-*) resolve on notched/home-
// indicator devices so fixed UI (e.g. the mobile nav drawer) can pad around it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * Blocking script: resolves the theme before hydration (no flash).
         * Auth routes follow the OS; signed-in routes use the saved preference.
         */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
