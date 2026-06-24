import type { AuthUser } from '../context/AuthContext';
import { deriveProfileFromFullName } from '../lib/authValidation';

export type MockAccount = {
  email: string;
  password: string;
  displayName: string;
  initials: string;
};

const ACCOUNTS_KEY = 't2f_mock_accounts';
const SESSION_KEY = 't2f_mock_session';

const seedAccount: MockAccount = {
  email: 'ana.martins@email.com',
  password: 'senha123',
  displayName: 'Ana',
  initials: 'AM',
};

function readAccounts(): MockAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as MockAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: MockAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function ensureSeedAccounts(): MockAccount[] {
  const accounts = readAccounts();
  if (accounts.length === 0) {
    writeAccounts([seedAccount]);
    return [seedAccount];
  }
  return accounts;
}

function accountToAuthUser(account: MockAccount): AuthUser {
  return {
    id: account.email,
    email: account.email,
    displayName: account.displayName,
    initials: account.initials,
  };
}

export function initMockAuthStore(): void {
  ensureSeedAccounts();
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email) {
      return null;
    }
    const accounts = ensureSeedAccounts();
    const account = accounts.find(
      (item) => item.email.toLowerCase() === parsed.email.toLowerCase(),
    );
    return account ? accountToAuthUser(account) : null;
  } catch {
    return null;
  }
}

export function setSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function emailExists(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return ensureSeedAccounts().some((account) => account.email.toLowerCase() === normalized);
}

export function validateLogin(email: string, password: string): AuthUser | null {
  const normalized = email.trim().toLowerCase();
  const account = ensureSeedAccounts().find(
    (item) => item.email.toLowerCase() === normalized && item.password === password,
  );
  return account ? accountToAuthUser(account) : null;
}

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export function registerAccount(payload: RegisterPayload): AuthUser {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (emailExists(normalizedEmail)) {
    throw new Error('E-mail já cadastrado.');
  }

  const { displayName, initials } = deriveProfileFromFullName(payload.fullName);
  const account: MockAccount = {
    email: normalizedEmail,
    password: payload.password,
    displayName,
    initials,
  };

  const accounts = ensureSeedAccounts();
  writeAccounts([...accounts, account]);
  return accountToAuthUser(account);
}

export function updatePassword(email: string, password: string): boolean {
  const normalized = email.trim().toLowerCase();
  const accounts = ensureSeedAccounts();
  const index = accounts.findIndex((account) => account.email.toLowerCase() === normalized);

  if (index === -1) {
    return false;
  }

  const updated = [...accounts];
  updated[index] = { ...updated[index], password };
  writeAccounts(updated);
  return true;
}

export const MOCK_RESET_TOKEN = 'mock-reset-token';
