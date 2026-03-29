import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Web3Provider } from "@/providers/Web3Provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { ErrorPingWrapper } from "@/providers/ErrorPingProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GhostBalance",
  description: "ZK balance proof for anonymous chat",
};

// Inline script to prevent FOUC. Sets critical CSS variables from localStorage
// before React hydrates. All values are CSS variables — no data-* boolean flags.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem("ghostbalance-theme");
    if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "matrix" : "warm-coral";
    var m = {
      "matrix":        { bg:"#000000", p:"#10b981", os:"#10b981", gr:"0.015", sc:"0" },
      "cyan-m3":       { bg:"#0e0e13", p:"#8ff5ff", os:"#f9f5fd", gr:"0.015", sc:"0" },
      "warm-coral":    { bg:"#FFFBF7", p:"#FF7F50", os:"#2D2A26", gr:"0",     sc:"0" },
      "synthwave":     { bg:"#0F0A1A", p:"#FF2D7B", os:"#E2E8F0", gr:"0",     sc:"0.03" },
      "art-deco-noir": { bg:"#080808", p:"#C9A96E", os:"#E8DCC8", gr:"0.015", sc:"0" },
      "forest-organic":{ bg:"#0D1B0E", p:"#7C9A6E", os:"#E4DCCF", gr:"0",     sc:"0" },
      "brutalist":     { bg:"#1A1A1A", p:"#FF3B30", os:"#FFFFFF", gr:"0",     sc:"0" },
      "clean-teal":    { bg:"#F8F8F8", p:"#00BCD4", os:"#1A1A1A", gr:"0",     sc:"0" }
    };
    var c = m[t] || m["matrix"];
    var h = document.documentElement;
    h.style.setProperty("--color-background", c.bg);
    h.style.setProperty("--color-primary", c.p);
    h.style.setProperty("--color-on-surface", c.os);
    h.style.setProperty("--grain-opacity", c.gr);
    h.style.setProperty("--scanline-opacity", c.sc);
    h.setAttribute("data-theme", t);
    document.body && (document.body.style.backgroundColor = c.bg);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <div className="grain-overlay" />
        <div className="scanline-overlay" />
        <ErrorPingWrapper>
          <ThemeProvider>
            <Web3Provider>
              <AuthProvider>
                <ToastProvider>{children}</ToastProvider>
              </AuthProvider>
            </Web3Provider>
          </ThemeProvider>
        </ErrorPingWrapper>
      </body>
    </html>
  );
}
