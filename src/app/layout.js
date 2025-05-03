import "./globals.css";
import { Pixelify_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const pixelifySans = Pixelify_Sans({ subsets: ['latin'] });

export const metadata = {
  title: "BookBlitz",
  description: "BookBlitz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={pixelifySans.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
