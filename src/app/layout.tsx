import type { Metadata } from "next";
import "@/assets/styles/globals.css";
import { ErrorProvider } from "@/context/ErrorProvider";

export const metadata: Metadata = {
  title: "AWS Cost Monitor",
  description: "Monitor EC2 instance utilization and cloud costs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ErrorProvider>{children}</ErrorProvider>
      </body>
    </html>
  );
}
