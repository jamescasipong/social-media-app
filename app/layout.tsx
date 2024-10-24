import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ServerAuthProvider from "./contexts/auth-provider";

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
  keywords:
    "social media, social media management, online presence, engagement, digital marketing",
  authors: [{ name: "James Casipong" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="author" content="James Casipong" />
        <meta
          name="keywords"
          content="social media, social media management, online presence, engagement, digital marketing"
        />
        <meta
          name="description"
          content="Social Media Hub: Your All-in-One Platform for Social Engagement"
        />
        <link rel="author" href="https://www.linkedin.com/in/jamescasipong/" />
        <link rel="me" href="https://github.com/jamescasipong" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full`}
      >
        <ServerAuthProvider>{children}</ServerAuthProvider>
      </body>
    </html>
  );
}
