import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scrum Poker",
  description: "Casino-themed point estimation for agile teams",
};

// Inline script to apply saved theme before first paint (prevents FOUC)
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('bf-theme');
    if (theme === 'cosmoswin') {
      document.documentElement.setAttribute('data-theme', 'cosmoswin');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Anti-FOUC theme restore */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Cosmoswin fonts — loaded lazily via useTheme hook, preconnect here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
