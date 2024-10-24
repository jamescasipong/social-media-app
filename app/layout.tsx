import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SocMediaHub",
  description: `Social Media Hub: Your All-in-One Platform for Social Engagement

Welcome to Social Media Hub, the ultimate destination for enhancing your online presence! Our platform offers comprehensive tools and resources designed to streamline your social media management, boost engagement, and maximize your reach. Whether you’re a small business, influencer, or digital marketer, Social Media Hub provides easy-to-use features for scheduling posts, analyzing performance metrics, and connecting with your audience across multiple platforms.

Stay ahead of the competition with our intuitive dashboard, where you can track trends, measure success, and fine-tune your strategy. With a focus on user-friendly navigation and powerful analytics, Social Media Hub empowers you to create compelling content that resonates with your target audience.

Join the community of savvy social media users and elevate your brand’s online presence today! Experience the future of social media management with Social Media Hub – where connectivity meets creativity.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en ">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full `}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
