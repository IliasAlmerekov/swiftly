import { AppProvider } from './provider';
import { AppRouter } from './router';

/**
 * Root App component.
 * Composes the application from providers and router.
 *
 * This follows the bulletproof-react pattern:
 * - Provider handles all context/state providers
 * - Router handles all routing logic
 * - App is a thin composition layer
 */
export const App = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};
