import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://tio2products.com"),
  robots: { index: true, follow: true },
  icons: { icon: "/tio2-my/brand/tio2-malaysia-favicon-safe-v0.1.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
