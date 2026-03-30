import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vegan Map — Wilkes-Barre, PA',
  description: 'Find vegan and vegan-friendly restaurants in Wilkes-Barre, PA and surrounding areas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
