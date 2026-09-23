import './globals.css';
import Header from '../components/Header';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'HR Management System',
  description:
    'Comprehensive HR Management System with employee management, payroll, leave tracking, and more.',
  keywords: [
    'HR',
    'Human Resources',
    'Employee Management',
    'Payroll',
    'Leave Management',
  ],
  authors: [{ name: 'HR Management System' }],
  // viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Next.js automatically injects metadata from the export above */}
      </head>
      <body>
        <AuthProvider>
          {/* <Header /> */}
          <main className="w-full">{children}</main>
                  <Toaster position="top-right" richColors /> 

        </AuthProvider>
      </body>
    </html>
  );
}
