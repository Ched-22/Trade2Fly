import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <MarketplaceProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MarketplaceProvider>
  );
}
