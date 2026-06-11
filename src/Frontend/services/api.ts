import { Evenement, MembreEquipe, Sermon } from '../types';

interface ReponseApi<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface ReponsePaginee<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SermonBackend {
  id: number | string;
  titre: string;
  verset?: string;
  description?: string;
  chemin?: string;
  date?: string;
  auteur?: string;
  categorie?: string;
}

interface EvenementBackend {
  id: number | string;
  titre: string;
  lieu?: string;
  description?: string;
  categorie?: string;
  heure?: string;
  date?: string;
}

interface UtilisateurBackend {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at?: string;
}

export interface FichierBackend {
  id: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  is_public: number | boolean;
  uploader_username?: string;
  created_at?: string;
}

export interface MessageContact {
  id: string;
  nom: string;
  email: string;
  sujet: string;
  contenu: string;
  created_at: string;
}

export type StatutDonation = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface DonationBackend {
  id: string;
  reference: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  amount: number;
  currency: string;
  designation: string;
  description?: string;
  status: StatutDonation;
  provider: string;
  provider_transaction_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonetbilConfig {
  serviceKey: string;
  paymentUrl: string;
  notifyUrl: string;
  returnUrl: string;
  cancelUrl: string;
}

const categoriesSermon = ['Dimanche', 'Enseignement', 'Fête', 'Dévotion', 'Exhortation'] as const;
const categoriesEvenement = ['Culte', 'Jeunesse', 'Prière', 'Social'] as const;

const obtenirBaseApi = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  return `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

export const obtenirUrlFichier = (id: string, mode: 'stream' | 'download' = 'stream') => {
  return `${obtenirBaseApi()}/files/${id}/${mode}`;
};

const obtenirToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-access-token');
};

const normaliserCategorieSermon = (categorie?: string): Sermon['categorie'] => {
  return categoriesSermon.includes(categorie as Sermon['categorie'])
    ? (categorie as Sermon['categorie'])
    : 'Enseignement';
};

const normaliserCategorieEvenement = (categorie?: string): Evenement['categorie'] => {
  return categoriesEvenement.includes(categorie as Evenement['categorie'])
    ? (categorie as Evenement['categorie'])
    : 'Culte';
};

const convertirSermon = (sermon: SermonBackend): Sermon => ({
  identifiant: String(sermon.id),
  titre: sermon.titre || 'Enseignement sans titre',
  orateur: sermon.auteur || 'Orateur non renseigné',
  date: sermon.date || '',
  passageBiblique: sermon.verset || '',
  categorie: normaliserCategorieSermon(sermon.categorie),
  resume: sermon.description || '',
  urlAudio: sermon.chemin || '',
});

const convertirEvenement = (evenement: EvenementBackend): Evenement => ({
  identifiant: String(evenement.id),
  titre: evenement.titre || 'Événement sans titre',
  description: evenement.description || '',
  date: evenement.date || '',
  heure: evenement.heure || '',
  lieu: evenement.lieu || '',
  categorie: normaliserCategorieEvenement(evenement.categorie),
  placesDisponibles: 100,
});

const convertirUtilisateurEnMembre = (utilisateur: UtilisateurBackend): MembreEquipe => {
  const nom = utilisateur.username || utilisateur.email;
  const initiales = nom
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((partie) => partie[0]?.toUpperCase())
    .join('') || 'UT';

  return {
    identifiant: utilisateur.id,
    nom,
    role: utilisateur.role === 'admin' ? 'Administrateur' : 'Membre',
    email: utilisateur.email,
    biographie: `Compte ${utilisateur.role}`,
    initiales,
  };
};

async function requeteApi<T>(chemin: string, options: RequestInit = {}, authentifie = false): Promise<T> {
  const headers = new Headers(options.headers);
  const token = obtenirToken();

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (authentifie && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const reponse = await fetch(`${obtenirBaseApi()}${chemin}`, {
    ...options,
    headers,
  });
  const payload = (await reponse.json().catch(() => null)) as ReponseApi<T> | null;

  if (!reponse.ok || !payload?.success) {
    throw new Error(payload?.error || 'Erreur de communication avec le serveur.');
  }

  return payload.data as T;
}

export const api = {
  async obtenirConfigurationMonetbil(): Promise<MonetbilConfig> {
    return requeteApi<MonetbilConfig>('/donations/monetbil/config');
  },

  async preparerDonation(donation: {
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    amount: number;
    designation: string;
    description: string;
  }): Promise<DonationBackend> {
    return requeteApi<DonationBackend>('/donations', {
      method: 'POST',
      body: JSON.stringify(donation),
    });
  },

  async listerDonations(): Promise<DonationBackend[]> {
    return requeteApi<DonationBackend[]>('/donations', {}, true);
  },

  async mettreAJourStatutDonation(id: string, status: StatutDonation): Promise<DonationBackend> {
    return requeteApi<DonationBackend>(`/donations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  },

  async envoyerMessageContact(message: Omit<MessageContact, 'id' | 'created_at'>): Promise<MessageContact> {
    return requeteApi<MessageContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  async listerMessagesContact(): Promise<MessageContact[]> {
    return requeteApi<MessageContact[]>('/contacts', {}, true);
  },

  async supprimerMessageContact(id: string): Promise<void> {
    await requeteApi<null>(`/contacts/${id}`, { method: 'DELETE' }, true);
  },

  async listerSermons(): Promise<Sermon[]> {
    const donnees = await requeteApi<SermonBackend[]>('/sermons');
    return donnees.map(convertirSermon);
  },

  async creerSermon(sermon: Omit<Sermon, 'identifiant'>): Promise<Sermon> {
    const resultat = await requeteApi<{ id: number | string }>('/sermons', {
      method: 'POST',
      body: JSON.stringify({
        titre: sermon.titre,
        verset: sermon.passageBiblique,
        description: sermon.resume,
        chemin: sermon.urlAudio,
        date: sermon.date,
        auteur: sermon.orateur,
        categorie: sermon.categorie,
      }),
    }, true);

    return { identifiant: String(resultat.id), ...sermon };
  },

  async supprimerSermon(id: string): Promise<void> {
    await requeteApi<null>(`/sermons/${id}`, { method: 'DELETE' }, true);
  },

  async listerEvenements(): Promise<Evenement[]> {
    const donnees = await requeteApi<EvenementBackend[]>('/events');
    return donnees.map(convertirEvenement);
  },

  async creerEvenement(evenement: Omit<Evenement, 'identifiant'>): Promise<Evenement> {
    const resultat = await requeteApi<{ id: number | string }>('/events', {
      method: 'POST',
      body: JSON.stringify({
        titre: evenement.titre,
        lieu: evenement.lieu,
        description: evenement.description,
        categorie: evenement.categorie,
        heure: evenement.heure,
        date: evenement.date,
      }),
    }, true);

    return { identifiant: String(resultat.id), ...evenement };
  },

  async supprimerEvenement(id: string): Promise<void> {
    await requeteApi<null>(`/events/${id}`, { method: 'DELETE' }, true);
  },

  async listerMembres(): Promise<MembreEquipe[]> {
    const donnees = await requeteApi<ReponsePaginee<UtilisateurBackend>>('/users?limit=100', {}, true);
    return donnees.items.map(convertirUtilisateurEnMembre);
  },

  async listerMembresPublics(): Promise<MembreEquipe[]> {
    const donnees = await requeteApi<ReponsePaginee<UtilisateurBackend>>('/users/public?limit=100');
    return donnees.items.map(convertirUtilisateurEnMembre);
  },

  async creerMembre(membre: Omit<MembreEquipe, 'identifiant'>): Promise<MembreEquipe> {
    const username = membre.nom.trim();
    const email = membre.email?.trim() || `${username.toLowerCase().replace(/\s+/g, '.')}@labonnesemence.local`;
    const utilisateur = await requeteApi<UtilisateurBackend>('/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password: 'ChangeMe123',
        role: membre.role.toLowerCase().includes('admin') ? 'admin' : 'user',
      }),
    }, true);

    return { ...membre, identifiant: utilisateur.id, email: utilisateur.email };
  },

  async supprimerMembre(id: string): Promise<void> {
    await requeteApi<null>(`/users/${id}`, { method: 'DELETE' }, true);
  },

  async listerFichiers(): Promise<FichierBackend[]> {
    const donnees = await requeteApi<ReponsePaginee<FichierBackend>>('/files?limit=100', {}, true);
    return donnees.items;
  },

  async listerFichiersPublics(): Promise<FichierBackend[]> {
    const donnees = await requeteApi<ReponsePaginee<FichierBackend>>('/files/public?limit=100');
    return donnees.items;
  },

  async envoyerFichier(file: File): Promise<FichierBackend> {
    const donnees = new FormData();
    donnees.append('file', file);
    donnees.append('is_public', 'true');

    return requeteApi<FichierBackend>('/files/upload', {
      method: 'POST',
      body: donnees,
    }, true);
  },

  async supprimerFichier(id: string): Promise<void> {
    await requeteApi<null>(`/files/${id}`, { method: 'DELETE' }, true);
  },
};
