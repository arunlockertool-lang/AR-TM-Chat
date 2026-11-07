import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  projectId: string;
  error?: string;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isConfigured = false;

try {
  // Only initialize if non-placeholder
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('SAMPLE_KEY')) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    isConfigured = true;
  }
} catch (e) {
  console.warn('Firebase initialization skipped, fallback storage enabled:', e);
}

export { app, auth, db, isConfigured };

/**
 * Validate connection to Firestore as required by system guidelines
 */
export async function testFirestoreConnection(): Promise<FirebaseStatus> {
  if (!isConfigured || !db) {
    return {
      isConfigured: false,
      isConnected: false,
      projectId: firebaseConfig.projectId || 'local-demo',
      error: 'Firebase credentials not yet provided or using local engine.',
    };
  }

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return {
      isConfigured: true,
      isConnected: true,
      projectId: firebaseConfig.projectId,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      isConfigured: true,
      isConnected: false,
      projectId: firebaseConfig.projectId,
      error: msg.includes('offline') ? 'Client is offline or network restricted' : msg,
    };
  }
}
