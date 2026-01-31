import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AK Fitness Dashboard",
  description: "Personal fitness tracking dashboard - Track your progress across body composition, strength, cardio, recovery, and functional fitness.",
  keywords: ["fitness", "tracking", "dashboard", "health", "workout", "recovery"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
