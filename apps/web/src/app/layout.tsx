import './globals.css';

export const metadata = {
  title: 'Sagas',
  description: 'A map-based archive of what people know about places.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
