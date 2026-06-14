import type { Metadata } from "next";
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
      <body className={`${geist.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
