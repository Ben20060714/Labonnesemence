import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

let initialized = false;

function loadServiceAccount(): admin.ServiceAccount | null {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const keyPathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (jsonEnv) {
    try {
      return JSON.parse(jsonEnv) as admin.ServiceAccount;
    } catch (error: any) {
      console.error('Impossible de parser FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
      return null;
    }
  }

  if (keyPathEnv) {
    try {
      const resolvedPath = path.resolve(process.cwd(), keyPathEnv);
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return JSON.parse(content) as admin.ServiceAccount;
    } catch (error: any) {
      console.error('Impossible de lire FIREBASE_SERVICE_ACCOUNT_PATH:', error.message);
      return null;
    }
  }

  // Fallback: use bundled key file if present in project utils
  try {
    const defaultKeyPath = path.resolve(process.cwd(), 'src', 'Backend', 'utils', 'la-bonne-semence-firebase-adminsdk-fbsvc-e51e91e385.json');
    if (fs.existsSync(defaultKeyPath)) {
      const content = fs.readFileSync(defaultKeyPath, 'utf8');
      return JSON.parse(content) as admin.ServiceAccount;
    }
  } catch (error: any) {
    console.error('Impossible de lire la clé Firebase par défaut :', error.message);
  }

  return null;
}

export function initializeFirebase(): void {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return;
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.warn('Firebase Admin n’est pas configuré. Définissez FIREBASE_SERVICE_ACCOUNT_JSON ou FIREBASE_SERVICE_ACCOUNT_PATH.');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
  console.log('Firebase Admin initialisé.');
}

export async function sendTopicNotification(
  title: string,
  body: string,
  topic = 'all_users',
  data?: Record<string, string>
): Promise<string> {
  if (!initialized && admin.apps.length === 0) {
    initializeFirebase();
  }

  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin n’est pas initialisé. Notification non envoyée.');
  }

  const message: admin.messaging.Message = {
    topic,
    notification: {
      title,
      body,
    },
    data: data ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])) : undefined,
  };

  return admin.messaging().send(message);
}
