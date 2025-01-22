import { Metadata } from "next";
import { Providers } from "@/lib/context";
export const metadata: Metadata = {
  title: "zkUSD",
  description: "Stablecoin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head></head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
