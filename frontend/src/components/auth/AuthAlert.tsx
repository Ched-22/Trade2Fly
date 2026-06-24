import type { ReactNode } from 'react';

type AuthAlertVariant = 'error' | 'success' | 'info';

type AuthAlertProps = {
  variant?: AuthAlertVariant;
  children: ReactNode;
};

const variantClasses: Record<AuthAlertVariant, string> = {
  error: 'border-error/30 bg-error/5 text-error',
  success: 'border-liberado/30 bg-liberado/5 text-liberado',
  info: 'border-voo/30 bg-voo/5 text-voo-dark',
};

export function AuthAlert({ variant = 'info', children }: AuthAlertProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${variantClasses[variant]}`}
      role="alert"
    >
      {children}
    </div>
  );
}
