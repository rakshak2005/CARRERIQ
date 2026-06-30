import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbCreateUser, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as fbSendPasswordResetEmail
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isRealFirebase = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  !firebaseConfig.apiKey.startsWith('placeholder')
);

let realAuth: any = null;

if (isRealFirebase) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realAuth = getAuth(app);
    console.log('[Firebase] Real Firebase Auth initialized.');
  } catch (error) {
    console.error('[Firebase] Failed to initialize real Firebase app:', error);
  }
} else {
  console.log('[Firebase] Running in Simulated Firebase Fallback Mode.');
}

// Simulated Auth State
interface SimulatedUser {
  uid: string;
  email: string;
}

let simulatedUser: SimulatedUser | null = null;
const authChangeListeners: Array<(user: any) => void> = [];

// Load simulated session from localStorage
const storedSimulatedUser = localStorage.getItem('careeriq_simulated_user');
if (storedSimulatedUser) {
  try {
    simulatedUser = JSON.parse(storedSimulatedUser);
  } catch (e) {
    // Ignore
  }
}

const triggerAuthChange = () => {
  authChangeListeners.forEach(listener => listener(simulatedUser));
};

export const loginWithEmail = async (email: string, password: string): Promise<any> => {
  if (isRealFirebase && realAuth) {
    const userCredential = await fbSignIn(realAuth, email, password);
    return userCredential.user;
  } else {
    // Simulated auth
    if (!email.includes('@')) {
      throw new Error('auth/invalid-email');
    }
    if (password.length < 6) {
      throw new Error('auth/weak-password');
    }
    
    simulatedUser = {
      uid: `simulated-uid-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: email
    };
    localStorage.setItem('careeriq_simulated_user', JSON.stringify(simulatedUser));
    triggerAuthChange();
    return simulatedUser;
  }
};

export const registerWithEmail = async (email: string, password: string): Promise<any> => {
  if (isRealFirebase && realAuth) {
    const userCredential = await fbCreateUser(realAuth, email, password);
    return userCredential.user;
  } else {
    // Simulated auth
    if (!email.includes('@')) {
      throw new Error('auth/invalid-email');
    }
    if (password.length < 6) {
      throw new Error('auth/weak-password');
    }
    
    simulatedUser = {
      uid: `simulated-uid-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: email
    };
    localStorage.setItem('careeriq_simulated_user', JSON.stringify(simulatedUser));
    triggerAuthChange();
    return simulatedUser;
  }
};

export const logoutUser = async (): Promise<void> => {
  if (isRealFirebase && realAuth) {
    await fbSignOut(realAuth);
  } else {
    simulatedUser = null;
    localStorage.removeItem('careeriq_simulated_user');
    triggerAuthChange();
  }
};

export const subscribeToAuthChanges = (callback: (user: any) => void): (() => void) => {
  if (isRealFirebase && realAuth) {
    return fbOnAuthStateChanged(realAuth, callback);
  } else {
    authChangeListeners.push(callback);
    // Call immediately with current state
    setTimeout(() => callback(simulatedUser), 0);
    return () => {
      const idx = authChangeListeners.indexOf(callback);
      if (idx !== -1) authChangeListeners.splice(idx, 1);
    };
  }
};

export const loginWithGoogle = async (): Promise<any> => {
  if (isRealFirebase && realAuth) {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(realAuth, provider);
    return userCredential.user;
  } else {
    // Simulated Google Auth fallback
    simulatedUser = {
      uid: 'simulated-uid-google-user',
      email: 'google-user@example.com'
    };
    localStorage.setItem('careeriq_simulated_user', JSON.stringify(simulatedUser));
    triggerAuthChange();
    return simulatedUser;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isRealFirebase && realAuth) {
    await fbSendPasswordResetEmail(realAuth, email);
  } else {
    // Simulated Password Reset fallback
    console.log(`[Firebase Sim] Password reset email link printed for: ${email}`);
    alert(`[Simulated Firebase] A password reset link has been simulated for: ${email}`);
  }
};

export const getCurrentUserToken = async (): Promise<string | null> => {
  if (isRealFirebase && realAuth) {
    const user = realAuth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } else {
    if (simulatedUser) {
      return `simulated-token:${simulatedUser.email}:${simulatedUser.uid}`;
    }
    return null;
  }
};

export { isRealFirebase };
