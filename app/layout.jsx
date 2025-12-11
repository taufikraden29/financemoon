import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Financial Moo',
  description: 'Your personal finance tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
