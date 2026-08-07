import { Evenement, MembreEquipe, Sermon } from '../types';
import { effacerSessionAuth, obtenirAccessToken, rafraichirSessionAuth } from './auth.ts';

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
  image_url?: string | null;
  date?: string;
  auteur?: string;
  categorie?: string;
}

interface EvenementBackend {
  id: number | string;
  titre: string;
  lieu?: string;
  description?: string;
  image_url?: string | null;
  categorie?: string;
  heure?: string;
  date?: string;
}

interface MembreHierarchieBackend {
  id: string;
  prenom: string;
  nom: string;
  fonction: string;
  biographie: string;
  email?: string | null;
  telephone?: string | null;
  afficher_coordonnees?: boolean;
  image_url?: string | null;
  created_at?: string;
}

export interface FichierBackend {
  id: string;
  filename: string;
  original_name: string;
  legend?: string | null;
  usage?: 'gallery' | 'cover';
  categorie?: string | null;
  mimetype: string;
  size: number;
  is_public: number | boolean;
  uploader_username?: string;
  created_at?: string;
}

export interface DevotionDuJourBackend {
  id: string;
  scheduled_date: string;
  verse_reference: string;
  verse_text: string;
  meditation_text: string;
  prayer_text: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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

export interface NewsletterResponse {
  email: string;
}

const categoriesSermon = ['Dimanche', 'Enseignement', 'Fête', 'Dévotion', 'Exhortation'] as const;
const categoriesEvenement = ['Culte', 'Jeunesse', 'Prière', 'Social'] as const;

const obtenirBaseApi = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  return '/api';
};

export const obtenirUrlFichier = (id: string, mode: 'stream' | 'download' = 'stream') => {
  return `${obtenirBaseApi()}/files/${id}/${mode}`;
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

export const calculerInitiales = (prenom?: string, nom?: string): string => {
  const premiereLettre = prenom?.trim().charAt(0) || '';
  const secondeLettre = nom?.trim().charAt(0) || '';
  const initiales = `${premiereLettre}${secondeLettre}`.toUpperCase();

  if (initiales) {
    return initiales;
  }

  return 'UT';
};

export const decomposerNomComplet = (nomComplet: string): { prenom: string; nom: string } => {
  const parties = nomComplet.trim().split(/\s+/).filter(Boolean);

  if (parties.length === 0) {
    return { prenom: '', nom: '' };
  }

  if (parties.length === 1) {
    return { prenom: parties[0], nom: '' };
  }

  return {
    prenom: parties[0],
    nom: parties.slice(1).join(' '),
  };
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
  imageUrl: sermon.image_url || undefined,
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
  imageUrl: evenement.image_url || undefined,
});

const convertirMembreHierarchie = (membre: MembreHierarchieBackend): MembreEquipe => {
  return {
    identifiant: membre.id,
    prenom: membre.prenom,
    nom: membre.nom,
    role: membre.fonction,
    biographie: membre.biographie,
    email: membre.afficher_coordonnees ? membre.email || undefined : undefined,
    telephone: membre.afficher_coordonnees ? membre.telephone || undefined : undefined,
    afficherCoordonnees: membre.afficher_coordonnees ?? false,
    imageUrl: membre.image_url || undefined,
  };
};

async function executerRequeteApi<T>(
  chemin: string,
  options: RequestInit = {},
  authentifie = false,
  dejaReessayee = false
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = obtenirAccessToken();

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

  if (reponse.status === 401 && authentifie && !dejaReessayee) {
    const sessionRenouvelee = await rafraichirSessionAuth();
    if (sessionRenouvelee?.accessToken) {
      return executerRequeteApi<T>(chemin, options, authentifie, true);
    }

    effacerSessionAuth();
  }

  if (!reponse.ok || !payload?.success) {
    throw new Error(payload?.error || 'Erreur de communication avec le serveur.');
  }

  return payload.data as T;
}

export const api = {
  async obtenirConfigurationMonetbil(): Promise<MonetbilConfig> {
    return executerRequeteApi<MonetbilConfig>('/donations/monetbil/config');
  },

  async preparerDonation(donation: {
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    amount: number;
    designation: string;
    description: string;
  }): Promise<DonationBackend> {
    return executerRequeteApi<DonationBackend>('/donations', {
      method: 'POST',
      body: JSON.stringify(donation),
    });
  },

  async listerDonations(): Promise<DonationBackend[]> {
    return executerRequeteApi<DonationBackend[]>('/donations', {}, true);
  },

  async mettreAJourStatutDonation(id: string, status: StatutDonation): Promise<DonationBackend> {
    return executerRequeteApi<DonationBackend>(`/donations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  },

  async envoyerMessageContact(message: Omit<MessageContact, 'id' | 'created_at'>): Promise<MessageContact> {
    return executerRequeteApi<MessageContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  async soumettreNewsletter(email: string): Promise<NewsletterResponse> {
    return executerRequeteApi<NewsletterResponse>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async listerMessagesContact(): Promise<MessageContact[]> {
    return executerRequeteApi<MessageContact[]>('/contacts', {}, true);
  },

  async supprimerMessageContact(id: string): Promise<void> {
    await executerRequeteApi<null>(`/contacts/${id}`, { method: 'DELETE' }, true);
  },

  async obtenirDevotionDuJour(): Promise<DevotionDuJourBackend | null> {
    return executerRequeteApi<DevotionDuJourBackend | null>('/daily-devotions/current');
  },

  async listerDevotions(): Promise<DevotionDuJourBackend[]> {
    const donnees = await executerRequeteApi<ReponsePaginee<DevotionDuJourBackend>>('/daily-devotions?limit=100', {}, true);
    return donnees.items;
  },

  async creerDevotion(devotion: Omit<DevotionDuJourBackend, 'id' | 'created_at' | 'updated_at'>): Promise<DevotionDuJourBackend> {
    return executerRequeteApi<DevotionDuJourBackend>('/daily-devotions', {
      method: 'POST',
      body: JSON.stringify(devotion),
    }, true);
  },

  async modifierDevotion(id: string, devotion: Partial<Omit<DevotionDuJourBackend, 'id' | 'created_at' | 'updated_at'>>): Promise<DevotionDuJourBackend> {
    return executerRequeteApi<DevotionDuJourBackend>(`/daily-devotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(devotion),
    }, true);
  },

  async supprimerDevotion(id: string): Promise<void> {
    await executerRequeteApi<null>(`/daily-devotions/${id}`, { method: 'DELETE' }, true);
  },

  async listerSermons(): Promise<Sermon[]> {
    const donnees = await executerRequeteApi<SermonBackend[]>('/sermons');
    return donnees.map(convertirSermon);
  },

  async creerSermon(sermon: Omit<Sermon, 'identifiant'>): Promise<Sermon> {
    const resultat = await executerRequeteApi<{ id: number | string }>('/sermons', {
      method: 'POST',
      body: JSON.stringify({
        titre: sermon.titre,
        verset: sermon.passageBiblique,
        description: sermon.resume,
        chemin: sermon.urlAudio,
        image_url: sermon.imageUrl || null,
        date: sermon.date,
        auteur: sermon.orateur,
        categorie: sermon.categorie,
      }),
    }, true);

    return { identifiant: String(resultat.id), ...sermon };
  },

  async supprimerSermon(id: string): Promise<void> {
    await executerRequeteApi<null>(`/sermons/${id}`, { method: 'DELETE' }, true);
  },

  async listerEvenements(): Promise<Evenement[]> {
    const donnees = await executerRequeteApi<EvenementBackend[]>('/events');
    return donnees.map(convertirEvenement);
  },

  async creerEvenement(evenement: Omit<Evenement, 'identifiant'>): Promise<Evenement> {
    const resultat = await executerRequeteApi<{ id: number | string }>('/events', {
      method: 'POST',
      body: JSON.stringify({
        titre: evenement.titre,
        lieu: evenement.lieu,
        description: evenement.description,
        image_url: evenement.imageUrl || null,
        categorie: evenement.categorie,
        heure: evenement.heure,
        date: evenement.date,
      }),
    }, true);

    return { identifiant: String(resultat.id), ...evenement };
  },

  async supprimerEvenement(id: string): Promise<void> {
    await executerRequeteApi<null>(`/events/${id}`, { method: 'DELETE' }, true);
  },

  async listerMembres(): Promise<MembreEquipe[]> {
    const donnees = await executerRequeteApi<ReponsePaginee<MembreHierarchieBackend>>('/hierarchy-members?limit=100', {}, true);
    return donnees.items.map(convertirMembreHierarchie);
  },

  async listerMembresPublics(): Promise<MembreEquipe[]> {
    const donnees = await executerRequeteApi<ReponsePaginee<MembreHierarchieBackend>>('/hierarchy-members/public?limit=24');
    return donnees.items.map(convertirMembreHierarchie);
  },

  async creerMembre(membre: Omit<MembreEquipe, 'identifiant'>): Promise<MembreEquipe> {
    const resultat = await executerRequeteApi<MembreHierarchieBackend>('/hierarchy-members', {
      method: 'POST',
      body: JSON.stringify({
        prenom: membre.prenom,
        nom: membre.nom,
        fonction: membre.role,
        biographie: membre.biographie,
        email: membre.email || null,
        telephone: membre.telephone || null,
        afficher_coordonnees: membre.afficherCoordonnees ?? false,
        image_url: membre.imageUrl || null,
      }),
    }, true);

    return convertirMembreHierarchie({ ...resultat, afficher_coordonnees: Boolean(resultat.afficher_coordonnees) });
  },

  async supprimerMembre(id: string): Promise<void> {
    await executerRequeteApi<null>(`/hierarchy-members/${id}`, { method: 'DELETE' }, true);
  },

  async listerFichiers(): Promise<FichierBackend[]> {
    const donnees = await executerRequeteApi<ReponsePaginee<FichierBackend>>('/files?limit=100', {}, true);
    return donnees.items;
  },

  async listerFichiersPublics(usage?: 'gallery' | 'cover' | 'all'): Promise<FichierBackend[]> {
    const parametres = new URLSearchParams({ limit: '100' });
    if (usage && usage !== 'all') {
      parametres.set('usage', usage);
    } else if (usage === 'all') {
      parametres.set('usage', 'all');
    }

    const donnees = await executerRequeteApi<ReponsePaginee<FichierBackend>>(`/files/public?${parametres.toString()}`);
    return donnees.items;
  },

  async envoyerFichier(file: File, options: { legend?: string; isPublic?: boolean; usage?: 'gallery' | 'cover'; categorie?: string } = {}): Promise<FichierBackend> {
    const { legend, isPublic = true, usage = 'gallery', categorie } = options;
    const donnees = new FormData();
    donnees.append('file', file);
    donnees.append('is_public', String(isPublic));
    donnees.append('usage', usage);

    if (legend?.trim()) {
      donnees.append('legend', legend.trim());
    }

    if (categorie?.trim()) {
      donnees.append('categorie', categorie.trim());
    }

    return executerRequeteApi<FichierBackend>('/files/upload', {
      method: 'POST',
      body: donnees,
    }, true);
  },

  async supprimerFichier(id: string): Promise<void> {
    await executerRequeteApi<null>(`/files/${id}`, { method: 'DELETE' }, true);
  },
};
