import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lejel WFH — Studio Coordination",
  description: "Platform manajemen kerja tim editor & Korea Team",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
