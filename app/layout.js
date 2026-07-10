import "./globals.css";
import { absoluteUrl, siteDescription, siteKeywords, siteName, siteUrl } from "../utils/seo";

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: `${siteName} | Create ERC20 Tokens on Polygon Amoy`,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Web3",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: `${siteName} | Create ERC20 Tokens on Polygon Amoy`,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteName} social preview`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Create ERC20 Tokens on Polygon Amoy`,
    description: siteDescription,
    images: ["/twitter-image"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export const viewport = {
  themeColor: "#4f46e5",
  colorScheme: "light"
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    description: siteDescription,
    url: absoluteUrl("/"),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: [
      "Create ERC20 tokens from a connected wallet",
      "Deploy token clones through an EIP-1167 factory",
      "Browse tokens launched through the factory",
      "Open token and transaction links on Polygon Amoy Polygonscan"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
