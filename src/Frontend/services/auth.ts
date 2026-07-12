type Role = 'admin' | 'user';

const CLE_TOKEN_ACCES = 'auth-access-token';
const CLE_TOKEN_RENOUVELLEMENT = 'auth-refresh-token';
const CLE_UTILISATEUR = 'auth-user';

export interface UtilisateurAuthentifie {
  id: string;
  email: string;
  username: string;
  role: Role;
  created_at: string;
  updated_at?: string;
  accessToken?: string;
  refreshToken?: string;
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

interface SessionTokensRenouveles {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayloadExpire {
  exp?: number;
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
  if (typeof window === 'undefined') return;

  localStorage.setItem(CLE_TOKEN_ACCES, session.accessToken);
  localStorage.setItem(CLE_TOKEN_RENOUVELLEMENT, session.refreshToken);
  localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(session.user));
};

export const obtenirAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CLE_TOKEN_ACCES);
};

export const obtenirRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CLE_TOKEN_RENOUVELLEMENT);
};

export const obtenirExpirationToken = (token: string): number | null => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const normalise = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalise.padEnd(Math.ceil(normalise.length / 4) * 4, '='));
    const payload = JSON.parse(decoded) as JwtPayloadExpire;

    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const mettreAJourTokensAuth = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(CLE_TOKEN_ACCES, accessToken);
  localStorage.setItem(CLE_TOKEN_RENOUVELLEMENT, refreshToken);
};

export const rafraichirSessionAuth = async (): Promise<SessionTokensRenouveles | null> => {
  const refreshToken = obtenirRefreshToken();
  if (!refreshToken) {
    effacerSessionAuth();
    return null;
  }

  const reponse = await fetch(`${obtenirBaseAuth()}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = (await reponse.json().catch(() => null)) as ReponseApi<SessionTokensRenouveles> | null;

  if (!reponse.ok || !payload?.success || !payload.data?.accessToken || !payload.data?.refreshToken) {
    effacerSessionAuth();
    return null;
  }

  mettreAJourTokensAuth(payload.data.accessToken, payload.data.refreshToken);
  return payload.data;
};

const chargerUtilisateurCourant = async (token: string) => {
  const reponse = await fetch(`${obtenirBaseAuth()}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await reponse.json().catch(() => null)) as ReponseApi<UtilisateurAuthentifie> | null;
  return { reponse, payload };
};

export const obtenirUtilisateurCourant = async () => {
  let token = obtenirAccessToken();

  if (!token) {
    const sessionRenouvelee = await rafraichirSessionAuth();
    token = sessionRenouvelee?.accessToken ?? null;
    if (!token) return null;
  }

  let resultat = await chargerUtilisateurCourant(token);

  if (resultat.reponse.status === 401) {
    const sessionRenouvelee = await rafraichirSessionAuth();
    if (!sessionRenouvelee?.accessToken) return null;

    resultat = await chargerUtilisateurCourant(sessionRenouvelee.accessToken);
  }

  if (!resultat.reponse.ok || !resultat.payload?.success || !resultat.payload.data) {
    effacerSessionAuth();
    return null;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(resultat.payload.data));
  }

  return resultat.payload.data;
};

export const effacerSessionAuth = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(CLE_TOKEN_ACCES);
  localStorage.removeItem(CLE_TOKEN_RENOUVELLEMENT);
  localStorage.removeItem(CLE_UTILISATEUR);
};
