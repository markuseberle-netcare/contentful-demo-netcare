export const metadata = {
  title: "Contentful Demo",
  description: "Visualisierung von Contentful-Inhalten mit Next.js",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Contentful Demo</h1>
            <nav className="opacity-80 text-sm">
              <a className="underline" href="/">Home</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
