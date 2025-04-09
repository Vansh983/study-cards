import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { VideoProvider } from '@/lib/video-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Doom Scroll',
  description: 'scroll through notes not instagram',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <VideoProvider>
            {children}
          </VideoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
