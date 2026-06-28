import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const jost = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1A1A1A',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in'),
  title: {
    default: "Silveri — Luxury Silver Jewelry",
    template: "%s | Silveri",
  },
  description:
    "Discover exquisite handcrafted silver jewelry. Shop rings, necklaces, earrings, bracelets and more at Silveri.",
  keywords: ["silver jewelry", "handcrafted jewelry", "luxury jewelry", "rings", "necklaces", "earrings"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Silveri",
    images: [
      {
        url: "/images/Silveri Brand Logo.png",
        width: 1080,
        height: 1080,
        alt: "Silveri — Crafted for Every Moment",
      },
    ],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable}`}>
      <head>
        {/*
          GTM JS snippet — strategy="beforeInteractive" guarantees Next.js
          injects this into the <head> of the SSR HTML, which is what
          Google Merchant Center and Google Search Console verify against.
          (strategy="afterInteractive" is client-side only and invisible
          to crawlers, which caused the "wrong location" error in Merchant Center.)
        */}
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WLWNQK54');`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-silver-50 text-silver-900 font-[family-name:var(--font-body)] pb-16 md:pb-0">
        {/*
          GTM noscript — must be the VERY FIRST child of <body>.
          Google Merchant Center checks this placement when verifying via GTM.
        */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WLWNQK54"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
        <SpeedInsights />
        {/* Google Identity Services — used by /login for Sign in with Google */}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
