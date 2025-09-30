import "./globals.css";
import AuthButtonsFirebase from "@/components/AuthButtonsFirebase";

export const metadata = { title: "Trip Splitter" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <header className="mx-auto max-w-6xl mt-6">
          <div className="rounded-3xl bg-white shadow-card border border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-semibold">Trip Splitter</div>
            <AuthButtonsFirebase />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
