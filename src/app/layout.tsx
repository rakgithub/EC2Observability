import type { Metadata } from "next";
import "@/assets/styles/globals.css";
import { AppProviders } from "@/context/AppProvider";

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
       <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
