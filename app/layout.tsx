import "./globals.scss";
import { Space_Grotesk } from "next/font/google";
import Providers from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Tu App",
  description: "Descripción breve",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`app sidebar-mini ltr light-mode ${spaceGrotesk.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
