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
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon_fizk.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
