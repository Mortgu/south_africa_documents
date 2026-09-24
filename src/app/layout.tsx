import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const description =
  "Product sheets, white papers and checklists to download. Some documents are freely available, others require a one-time email confirmation.";

// `||` rather than `??`: an env var set to an empty string must fall through as well.
const siteUrl =
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Downloads | dignum", template: "%s | dignum" },
  description,
  openGraph: {
    type: "website",
    siteName: "dignum",
    title: "Downloads | dignum",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <div className="flex grow flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
