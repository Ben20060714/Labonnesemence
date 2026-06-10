type Role = 'admin' | 'user';

export interface UtilisateurAuthentifie {
  id: string;
  email: string;
  username: string;
  role: Role;
  created_at: string;
  updated_at?: string;
}

interface ReponseApi<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SessionAuthentification {
  user: UtilisateurAuthentifie;
  accessToken: string;
  refreshToken: string;
}

const obtenirBaseAuth = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api/auth';
  }

  return `${window.location.protocol}//${window.location.hostname}:5000/api/auth`;
};

const envoyerRequeteAuth = async (
  endpoint: 'login' | 'register',
  donnees: Record<string, string>
): Promise<SessionAuthentification> => {
  const reponse = await fetch(`${obtenirBaseAuth()}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(donnees),
  });

  const payload = (await reponse.json().catch(() => null)) as ReponseApi<SessionAuthentification> | null;

  if (!reponse.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error || 'Une erreur est survenue. Veuillez réessayer.');
  }

  return payload.data;
};

export const connecterUtilisateur = (email: string, password: string) => {
  return envoyerRequeteAuth('login', { email, password });
};

export const inscrireUtilisateur = (username: string, email: string, password: string) => {
  return envoyerRequeteAuth('register', { username, email, password });
};

export const enregistrerSessionAuth = (session: SessionAuthentification) => {
  localStorage.setItem('auth-access-token', session.accessToken);
  localStorage.setItem('auth-refresh-token', session.refreshToken);
  localStorage.setItem('auth-user', JSON.stringify(session.user));
};

export const obtenirUtilisateurCourant = async () => {
  const token = localStorage.getItem('auth-access-token');
  if (!token) return null;

  const reponse = await fetch(`${obtenirBaseAuth()}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await reponse.json().catch(() => null)) as ReponseApi<UtilisateurAuthentifie> | null;

  if (!reponse.ok || !payload?.success || !payload.data) {
    effacerSessionAuth();
    return null;
  }

  localStorage.setItem('auth-user', JSON.stringify(payload.data));
  return payload.data;
};

export const effacerSessionAuth = () => {
  localStorage.removeItem('auth-access-token');
  localStorage.removeItem('auth-refresh-token');
  localStorage.removeItem('auth-user');
};
