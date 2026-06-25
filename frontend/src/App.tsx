import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <ScrollToTop />
        <AppRoutes />
      </MarketplaceProvider>
    </AuthProvider>
  );
}
