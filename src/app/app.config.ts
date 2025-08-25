import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { getAuth } from 'firebase/auth';

/**
 * Application configuration that provides all necessary services and providers
 * for the Angular application including Firebase integration, routing, and zone configuration.
 * 
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, appConfig);
 * ```
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({"projectId":"join-workflow","appId":"1:899988854739:web:709f31fef6a0b05d708126","storageBucket":"join-workflow.firebasestorage.app","apiKey":"AIzaSyBsRwZgGVpnlzkX6K3OqXAVKI5Yy25kpFk","authDomain":"join-workflow.firebaseapp.com","messagingSenderId":"899988854739"})),
    provideFirestore(() => getFirestore())
  ]
};
