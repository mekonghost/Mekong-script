
/**
 * Firebase configuration object.
 * These values are injected via environment variables or hardcoded as fallbacks.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyDbQjz_nVBDyq880kwc3kkKmi4aUuPE420",
  authDomain: "studio-9549853419.firebaseapp.com",
  projectId: "studio-9549853419",
  storageBucket: "studio-9549853419.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validates that the Firebase configuration is complete and not using placeholder strings.
 */
export function isFirebaseConfigValid() {
  const { apiKey, projectId } = firebaseConfig;
  return (
    !!apiKey && 
    apiKey !== 'undefined' && 
    apiKey.length > 5 &&
    !!projectId && 
    projectId !== 'undefined' &&
    projectId.length > 0
  );
}
