import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TradePartna",
    template: "%s | TradePartna",
  },
  description:
    "An AI coach that reviews every trade — journal, tag, and improve with systematic confidence.",
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
         * Blocking script: applies the persisted theme before hydration (no
         * flash). Public/auth routes (login, signup, landing, etc.) are ALWAYS
         * light — dark mode only applies inside the dashboard. Defaults to light.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;var PUB=['/','/login','/register','/verify-email','/forgot-password','/reset-password','/resend-verification'];var isPub=PUB.indexOf(p)>-1||/^\\/(login|register|verify-email|forgot-password|reset-password|resend-verification)(\\/|$)/.test(p);var s=localStorage.getItem('syncgram-theme');var t=s?JSON.parse(s).state?.theme:'system';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark&&!isPub)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
