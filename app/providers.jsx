'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { QueryProvider } from '@/lib/queryProvider';
import ToastContainer from '@/components/ToastContainer';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
