// Service — pro.service.ts
// Gère la session pro (localStorage) et les appels API de l'espace professionnel.

const SESSION_KEY = 'pro_session';

export interface ProSession {
  email: string;
  token: string;
}

export interface ProERP {
  ref: string;
  adresse: string;
  commune: string;
  date: string | null;
}

export interface ProAccount {
  email: string;
  credits: number;
  used: number;
  packs: { qty: number; date: string; stripe_id: string }[];
  erps: ProERP[];
}

// ─── Session localStorage ─────────────────────────────────────────────────────

export function getProSession(): ProSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email || !parsed?.token) return null;
    return parsed as ProSession;
  } catch {
    return null;
  }
}

export function saveProSession(email: string, token: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, token }));
}

export function clearProSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function proLogin(email: string): Promise<{ sent: true }> {
  const res = await fetch('/api/pro-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erreur lors de l\'envoi du lien');
  }
  return res.json();
}

export async function proVerify(token: string): Promise<{ email: string }> {
  const res = await fetch('/api/pro-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Lien invalide ou expiré');
  }
  return res.json();
}

export async function getProAccount(token: string): Promise<ProAccount> {
  const res = await fetch('/api/pro-account', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearProSession();
    throw new Error('Session expirée. Reconnectez-vous.');
  }
  if (!res.ok) {
    throw new Error('Impossible de charger votre compte');
  }
  return res.json();
}

export async function createProCheckout(
  pack: 'pack_10' | 'pack_50',
  token: string
): Promise<{ url: string }> {
  const res = await fetch('/api/create-pro-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pack, token }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erreur lors de la création du paiement');
  }
  return res.json();
}

export async function useProCredit(
  token: string,
  erpDocument: object
): Promise<{ success: true; credits_remaining: number }> {
  const res = await fetch('/api/pro-use-credit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, erpDocument }),
  });
  if (res.status === 402) {
    throw new Error('Crédits insuffisants. Rechargez votre compte.');
  }
  if (res.status === 401) {
    clearProSession();
    throw new Error('Session expirée. Reconnectez-vous.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erreur serveur');
  }
  return res.json();
}
