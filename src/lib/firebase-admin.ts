// This file is for server-side use only.
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

let adminDb: admin.firestore.Firestore;

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        adminDb = getFirestore();
    } catch (e) {
        console.error('Error initializing Firebase Admin SDK:', e);
    }
} else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin actions will fail.');
}

// @ts-ignore
export { adminDb };
