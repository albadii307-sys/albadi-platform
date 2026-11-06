'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Award,
  Building,
  Clock,
  Inbox,
  Layers,
  Layout,
  LogOut,
  Menu,
  ImageIcon,
  Settings,
  Users,
  FileText,
  ArrowUpRight,
  X,
} from '@/components/icons';
import { logoutAction } from '@/app/admin/actions';

const items = [
  { href: '/admin', label: 'لوحة التحكم', icon: Layout },
  { href: '/admin/requests', label: 'طلبات الخدمات', icon: Inbox },
  { href: '/admin/collections/sectors', label: 'القطاعات', icon: Layers },
  { href: '/admin/collections/companies', label: 'الشركات التابعة', icon: Building },
  { href: '/admin/collections/team', label: 'فريق العمل', icon: Users },
  { href: '/admin/collections/services', label: 'الخدمات', icon: Users },
  { href: '/admin/collections/projects', label: 'المشاريع', icon: FileText },
  { href: '/admin/collections/news', label: 'الأخبار', icon: Users },
  { href: '/admin/collections/pages', label: 'الصفحات', icon: FileText },
  { href: '/admin/media', label: 'الوسائط', icon: ImageIcon },
  { href: '/admin/settings', label: 'إعدادات الموقع', icon: Settings },
];

const contentItems = [
  { href: '/admin/content/why', label: 'لماذا مجموعة البادي', icon: Award },
  { href: '/admin/content/timeline', label: 'محطات من مسيرتنا', icon: Clock },
  { href: '/admin/galleries', label: 'معارض الصور', icon: ImageIcon },
];

export default function AdminSidebar({ email, role, logo }: { email: string; role: string; logo: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const roleLabel = role === 'admin' ? 'مدير النظام' : role === 'editor' ? 'محرر' : 'مسؤول طلبات';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`admin-menu-btn${open ? ' is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        aria-expanded={open}
        aria-controls="admin-side"
      >
        <Menu size={18} />
        <span>القائمة</span>
      </button>

      <div className={`admin-scrim${open ? ' is-on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside id="admin-side" className={`admin-side${open ? ' is-open' : ''}`}>
        <button type="button" className="admin-side-close" onClick={() => setOpen(false)} aria-label="إغلاق القائمة">
          <X size={18} />
        </button>

        <Link href="/admin" className="admin-brand">
          <img src={logo} alt="مجموعة البادي" />
          <span>
            لوحة التحكم
            <br />
            Al-Badi Admin
          </span>
        </Link>

        <span className="admin-label">إدارة الموقع</span>
        <nav className="admin-nav">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)) ? 'page' : undefined}
            >
              <item.icon size={17} /> {item.label}
            </Link>
          ))}
        </nav>

        <span className="admin-label">الصفحة الرئيسية</span>
        <nav className="admin-nav">
          {contentItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
            >
              <item.icon size={17} /> {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-user">
          <b>{email}</b>
          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{roleLabel}</span>
          <form action={logoutAction}>
            <button type="submit">
              <LogOut size={13} /> تسجيل الخروج
            </button>
          </form>
          <Link
            href="/ar"
            target="_blank"
            style={{ display: 'inline-flex', gap: 5, alignItems: 'center', marginTop: 12, fontSize: '0.74rem', opacity: 0.7 }}
          >
            عرض الموقع <ArrowUpRight size={12} />
          </Link>
        </div>
      </aside>
    </>
  );
}
