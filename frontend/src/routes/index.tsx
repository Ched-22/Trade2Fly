import { Navigate, Route, Routes } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { AppShell } from '../components/layout/AppShell';
import { AuthPage } from '../pages/AuthPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CreateListingPage } from '../pages/CreateListingPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { FaqPage } from '../pages/FaqPage';
import { HomePage } from '../pages/HomePage';
import { ListingPage } from '../pages/ListingPage';
import { MessagesPage } from '../pages/MessagesPage';
import { MyListingsPage } from '../pages/MyListingsPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProfileSettingsLayout } from '../components/profile/ProfileSettingsLayout';
import { ProfileAccountPage } from '../pages/profile/ProfileAccountPage';
import { ProfileContactPage } from '../pages/profile/ProfileContactPage';
import { ProfilePasswordPage } from '../pages/profile/ProfilePasswordPage';
import { ProfilePaymentPage } from '../pages/profile/ProfilePaymentPage';
import { ProfilePayoutPage } from '../pages/profile/ProfilePayoutPage';
import { SearchPage } from '../pages/SearchPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ContainerSizingGuidePage } from '../pages/tools/ContainerSizingGuidePage';
import { GearValueCalculatorPage } from '../pages/tools/GearValueCalculatorPage';
import { HarnessSizingGuidePage } from '../pages/tools/HarnessSizingGuidePage';
import { ToolsIndexPage } from '../pages/tools/ToolsIndexPage';
import { WingLoadingCalculatorPage } from '../pages/tools/WingLoadingCalculatorPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="busca" element={<SearchPage />} />
        <Route path="ferramentas" element={<ToolsIndexPage />} />
        <Route path="ferramentas/guia-harness" element={<HarnessSizingGuidePage />} />
        <Route path="ferramentas/wingloading" element={<WingLoadingCalculatorPage />} />
        <Route path="ferramentas/guia-container" element={<ContainerSizingGuidePage />} />
        <Route path="ferramentas/calculadora-valor" element={<GearValueCalculatorPage />} />
        <Route path="anuncio/:listingId" element={<ListingPage />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="vender"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route path="entrar" element={<AuthPage />}>
          <Route index element={<LoginForm />} />
          <Route path="criar-conta" element={<RegisterForm />} />
          <Route path="esqueci-senha" element={<ForgotPasswordForm />} />
          <Route path="redefinir-senha" element={<ResetPasswordForm />} />
        </Route>
        <Route
          path="mensagens"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="favoritos"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="perfil"
          element={
            <ProtectedRoute>
              <ProfileSettingsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfileAccountPage />} />
          <Route path="contato" element={<ProfileContactPage />} />
          <Route path="senha" element={<ProfilePasswordPage />} />
          <Route path="recebimento" element={<ProfilePayoutPage />} />
          <Route path="pagamento" element={<ProfilePaymentPage />} />
        </Route>
        <Route
          path="meus-anuncios"
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="configuracoes"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="faq" element={<FaqPage />} />
        <Route path="ajuda" element={<Navigate to="/faq" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
