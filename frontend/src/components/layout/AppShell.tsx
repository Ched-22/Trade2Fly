import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { useAuth } from '../../hooks/useAuth';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

export function AppShell() {
  const { loggedIn } = useAuth();

  return (
    <div
      className={`flex min-h-screen w-full flex-col bg-bruma ${
        loggedIn ? 'pb-[calc(3rem+env(safe-area-inset-bottom))] md:pb-0' : ''
      }`}
    >
      <Header />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
