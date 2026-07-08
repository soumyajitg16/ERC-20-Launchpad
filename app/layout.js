import "./globals.css";

export const metadata = {
  title: "TokenForge Launchpad",
  description: "Create and view tokens from a simple wallet-connected app.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
