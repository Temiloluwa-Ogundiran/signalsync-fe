import type { Metadata } from "next";
import localFont from "next/font/local";
import { Onest } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cabinetGrotesk = localFont({
  src: "../../public/fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Syncgram Trades",
  description:
    "Social trading platform — copy, journal, and discover trading streams",
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
         * Blocking script: reads the Zustand-persisted theme from localStorage
         * and applies the correct class before React hydrates, preventing any
         * flash of wrong theme. Falls back to "dark" if nothing is stored.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('syncgram-theme');var t=s?JSON.parse(s).state?.theme:'dark';if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body
        className={`${onest.variable} ${cabinetGrotesk.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
