import { Outlet } from 'react-router-dom';
import { ProfileSettingsNav } from './ProfileSettingsNav';

export function ProfileSettingsLayout() {
  return (
    <div className="t2f-page max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(220px,260px)_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProfileSettingsNav />
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
