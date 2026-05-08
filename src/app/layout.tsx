
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { AppShell } from '@/components/app-shell';
import { SplashScreen } from '@/components/splash-screen';

export const metadata: Metadata = {
  title: 'ESAN TOOLS | Digital Marketplace',
  description: 'Easy access to private Telegram groups and digital tools.',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { children } = props;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen overflow-x-hidden">
        <div className="scanline"></div>
        <FirebaseClientProvider>
          <SplashScreen />
          <AppShell>
            {children}
          </AppShell>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
