import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'tracks', 'connection_check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error('Firestore connection error: please verify network or Firebase setup.');
    }
  }
}
