/**
 * Main entry point for the Angular application.
 * Bootstraps the root App component with the application configuration.
 * Handles initialization errors and provides error logging.
 * 
 * @fileoverview Application bootstrap module that starts the Angular app
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Bootstraps the Angular application with the root App component.
 * Uses the standalone component approach with application configuration.
 * Catches and logs any initialization errors to the console.
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
