import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBsRwZgGVpnlzkX6K3OqXAVKI5Yy25kpFk',
  authDomain: 'join-workflow.firebaseapp.com',
  projectId: 'join-workflow',
  storageBucket: 'join-workflow.firebasestorage.app',
  messagingSenderId: '899988854739',
  appId: '1:899988854739:web:709f31fef6a0b05d708126',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
