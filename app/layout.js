import "./globals.css";

export const metadata = {
  title: "Create Token",
  description: "Create and view tokens from a simple wallet-connected app."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
