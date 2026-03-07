import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { ButtonClickSound } from "@/components/button-click-sound";
import { APP_LOGO_PATH } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://cutefolio"),
  title: "cutefolio",
  description:
    "Build and host your cute folio.",
  openGraph: {
    title: "cutefolio",
    description:
      "Build and host your cute folio.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: APP_LOGO_PATH,
    apple: APP_LOGO_PATH,
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
      className={GeistPixelSquare.variable}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var v = localStorage.getItem('theme');
                  var dark = v === 'dark' || (v !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.classList.toggle('dark', dark);
                } catch(e) {}
              })();
            `,
          }}
        />
        <AuthSessionProvider>
          <ThemeProvider>
            <ButtonClickSound />
            {children}
          </ThemeProvider>
        </AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
