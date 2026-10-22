import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { SupportChatWidget } from './components/support/SupportChatWidget';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <ChatProvider>
          <ScrollToTop />
          <AppRoutes />
          <SupportChatWidget />
        </ChatProvider>
      </MarketplaceProvider>
    </AuthProvider>
  );
}
