import { requireSession } from '@/lib/auth';
import { getSiteLogo } from '@/lib/queries';
import AdminSidebar from '@/components/admin/sidebar';

export default async function PanelLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const [session, logo] = await Promise.all([requireSession(), getSiteLogo()]);
  return (
    <div className="admin-shell">
      <AdminSidebar email={session.email} role={session.role} logo={logo} />
      <div className="admin-main">{children}</div>
      {modal}
    </div>
  );
}
