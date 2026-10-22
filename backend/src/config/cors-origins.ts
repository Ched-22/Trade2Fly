import { ConfigService } from '@nestjs/config';

const DEV_DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
];

function splitOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Origins allowed for HTTP CORS and Socket.IO in dev (5173/5174 when Vite picks another port). */
export function resolveCorsOrigins(config: ConfigService): string[] {
  const configured = [
    ...splitOrigins(config.get<string>('FRONTEND_URL')),
    ...splitOrigins(config.get<string>('ADMIN_CORS_ORIGIN')),
    ...splitOrigins(config.get<string>('WS_CORS_ORIGIN')),
  ];

  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const origins = isProduction ? configured : [...configured, ...DEV_DEFAULT_ORIGINS];

  return [...new Set(origins.filter(Boolean))];
}

export function corsOriginOption(origins: string[]): string[] | boolean {
  if (origins.length === 0) return true;
  return origins;
}
