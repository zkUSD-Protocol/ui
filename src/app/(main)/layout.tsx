import "../globals.css";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //@ts-ignore
  return <main className="min-h-screen">{children}</main>;
}
