import Link from 'next/link';
import { ArrowUpRight, ImageIcon, Inbox, Plus } from '@/components/icons';
import CountUp from '@/components/admin/count-up';
import { requestStatuses } from '@/lib/collections';
import { count, isSupabaseConfigured } from '@/lib/db';
import { getNews, getRequests } from '@/lib/queries';
import { pick } from '@/lib/i18n';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ar-OM-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));

const statusLabel = (status: string) => requestStatuses.find((s) => s.value === status)?.label ?? status;

const quickAdd = [
  { key: 'sectors', label: 'قطاع جديد' },
  { key: 'companies', label: 'شركة تابعة' },
  { key: 'team', label: 'عضو فريق' },
  { key: 'services', label: 'خدمة جديدة' },
  { key: 'projects', label: 'مشروع جديد' },
  { key: 'news', label: 'خبر جديد' },
];

export default async function DashboardPage() {
  const [sectors, companies, services, projects, news, media, requests, newRequests, latestNews] = await Promise.all([
    count('sectors'),
    count('companies'),
    count('services'),
    count('projects'),
    count('news'),
    count('media'),
    getRequests(),
    count('requests', { status: 'new' }),
    getNews('group', 5),
  ]);

  const hidden = await Promise.all(
    ['sectors', 'companies', 'services', 'projects', 'news'].map((table) => count(table, { is_published: false }))
  );
  const hiddenCounts = Object.fromEntries(['sectors', 'companies', 'services', 'projects', 'news'].map((key, i) => [key, hidden[i]]));

  const recent = requests.slice(0, 6);

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat('ar-OM-u-nu-latn', { month: 'short' }).format(date),
      count: 0,
    };
  });

  for (const request of requests) {
    const date = new Date(request.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = months.find((month) => month.key === key);
    if (bucket) bucket.count += 1;
  }

  const peak = Math.max(1, ...months.map((month) => month.count));

  const contentHealth = [
    { label: 'القطاعات', href: '/admin/collections/sectors', total: sectors, hidden: hiddenCounts.sectors },
    { label: 'الشركات', href: '/admin/collections/companies', total: companies, hidden: hiddenCounts.companies },
    { label: 'الخدمات', href: '/admin/collections/services', total: services, hidden: hiddenCounts.services },
    { label: 'المشاريع', href: '/admin/collections/projects', total: projects, hidden: hiddenCounts.projects },
    { label: 'الأخبار', href: '/admin/collections/news', total: news, hidden: hiddenCounts.news },
  ];
  const contentTotal = contentHealth.reduce((sum, row) => sum + row.total, 0);
  const contentHidden = contentHealth.reduce((sum, row) => sum + row.hidden, 0);

  const statCards: { label: string; value: number; hidden?: number; href: string; accent?: boolean }[] = [
    { label: 'القطاعات', value: sectors, hidden: hiddenCounts.sectors, href: '/admin/collections/sectors' },
    { label: 'الشركات التابعة', value: companies, hidden: hiddenCounts.companies, href: '/admin/collections/companies' },
    { label: 'الخدمات', value: services, hidden: hiddenCounts.services, href: '/admin/collections/services' },
    { label: 'المشاريع', value: projects, hidden: hiddenCounts.projects, href: '/admin/collections/projects' },
    { label: 'الأخبار', value: news, hidden: hiddenCounts.news, href: '/admin/collections/news' },
    { label: 'ملفات الوسائط', value: media, href: '/admin/media' },
    { label: 'طلبات جديدة', value: newRequests, href: '/admin/requests', accent: true },
    { label: 'إجمالي الطلبات', value: requests.length, href: '/admin/requests' },
  ];

  return (
    <>
      <div className="admin-topbar">
        <h1>لوحة التحكم</h1>
        <span className="crumb">نظرة عامة على المحتوى والطلبات</span>
      </div>
      <div className="admin-content">
        {!isSupabaseConfigured ? (
          <div className="alert-admin">
            <b>وضع المعاينة المحلي.</b> البيانات محفوظة في ملف <code dir="ltr">.data/db.json</code>. عند إضافة مفاتيح
            Supabase في <code dir="ltr">.env.local</code> ينتقل الموقع تلقائياً إلى قاعدة البيانات السحابية.{' '}
            <Link href="/admin/settings">إعدادات الشركة</Link>
          </div>
        ) : null}

        <div className="stat-grid">
          {statCards.map((card) => (
            <Link key={card.label} href={card.href} className={`stat-card${card.accent ? ' accent' : ''}`}>
              <span>{card.label}</span>
              <b>
                <CountUp value={card.value} />
              </b>
              {typeof card.hidden === 'number' ? (
                <small className={card.hidden ? 'stat-sub is-warn' : 'stat-sub'}>
                  {card.hidden ? `${card.hidden} مخفي من الموقع` : 'كلها منشورة'}
                </small>
              ) : (
                <small className="stat-sub">{card.accent ? 'بانتظار الرد' : 'فتح القسم'}</small>
              )}
              <i className="stat-go" aria-hidden="true">
                <ArrowUpRight size={14} />
              </i>
            </Link>
          ))}
        </div>

        <div className="a-dash-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>الطلبات خلال 6 أشهر</h2>
              <span className="row-sub">إجمالي {requests.length} طلب</span>
            </div>
            <div className="panel-body">
              <div className="a-cols" role="img" aria-label="عدد الطلبات في كل شهر خلال آخر ستة أشهر">
                {months.map((month) => (
                  <div className="a-col" key={month.key}>
                    <span className="a-col-value">{month.count}</span>
                    <div className="a-col-track">
                      <i
                        className="a-col-fill"
                        style={{ height: `${Math.max(month.count ? 8 : 2, (month.count / peak) * 100)}%` }}
                      />
                    </div>
                    <span className="a-col-label">{month.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>توزيع الطلبات حسب الحالة</h2>
              <span className="row-sub">{requests.length} طلب</span>
            </div>
            <div className="panel-body">
              {requests.length ? (
                <div className="a-bars">
                  {requestStatuses.map((status) => {
                    const total = requests.filter((request) => request.status === status.value).length;
                    const percent = Math.round((total / requests.length) * 100);
                    return (
                      <div className="a-bar" key={status.value}>
                        <span className="a-bar-label">{status.label}</span>
                        <div className="a-bar-track">
                          <i className={`a-bar-fill status-${status.value}`} style={{ width: `${percent}%` }} />
                        </div>
                        <b>{total}</b>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  ستظهر النسب بعد وصول أول طلب.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-two-col">
          <div className="panel">
            <div className="panel-head">
              <h2>صحة المحتوى</h2>
              <span className="row-sub">منشور مقابل مخفي</span>
            </div>
            <div className="panel-body">
              <div className="a-health">
                {contentHealth.map((row) => {
                  const live = Math.max(0, row.total - row.hidden);
                  const livePercent = row.total ? Math.round((live / row.total) * 100) : 0;
                  return (
                    <Link className="a-health-row" key={row.label} href={row.href}>
                      <span className="a-health-label">{row.label}</span>
                      <span className="a-health-track">
                        <i className="a-health-live" style={{ width: `${livePercent}%` }} />
                        <i className="a-health-hidden" style={{ width: `${100 - livePercent}%` }} />
                      </span>
                      <b>
                        {live}
                        {row.hidden ? <small> · {row.hidden} مخفي</small> : null}
                      </b>
                    </Link>
                  );
                })}
              </div>
              <div className="a-health-legend">
                <span>{contentTotal} عنصر في المحتوى</span>
                <span className="a-health-legend-end">
                  <span>
                    <i className="dot live" /> {contentTotal - contentHidden} منشور
                  </span>
                  <span>
                    <i className="dot hidden" /> {contentHidden} مخفي
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>إضافة سريعة</h2>
            </div>
            <div className="panel-body">
              <div className="a-quick-grid">
                {quickAdd.map((item) => (
                  <Link key={item.key} className="a-btn" href={`/admin/collections/${item.key}/new`}>
                    <Plus size={15} /> {item.label}
                  </Link>
                ))}
                <Link className="a-btn" href="/admin/media">
                  <ImageIcon size={15} /> رفع صورة أو ملف
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>آخر طلبات الخدمات</h2>
            <Link href="/admin/requests" className="a-btn">
              <Inbox size={15} /> كل الطلبات
            </Link>
          </div>
          {recent.length ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>الخدمة</th>
                  <th>العميل</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recent.map((request) => (
                  <tr key={request.id}>
                    <td dir="ltr" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {request.ref}
                    </td>
                    <td className="row-title">{request.service_name ?? '—'}</td>
                    <td>
                      <div className="row-title">{request.name}</div>
                      <div className="row-sub" dir="ltr">
                        {request.phone}
                      </div>
                    </td>
                    <td>
                      <span className={`badge status-${request.status}`}>{statusLabel(request.status)}</span>
                    </td>
                    <td className="row-sub">{formatDate(request.created_at)}</td>
                    <td style={{ textAlign: 'end' }}>
                      <Link href={`/admin/requests/${request.id}`} className="a-btn">
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              لا توجد طلبات بعد. جرّب إرسال طلب من{' '}
              <Link href="/ar/request" target="_blank" style={{ textDecoration: 'underline' }}>
                صفحة الطلب
              </Link>
              .
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>آخر الأخبار</h2>
            <Link href="/admin/collections/news" className="a-btn">
              إدارة الأخبار
            </Link>
          </div>
          <div className="panel-body">
            <div className="a-news-grid">
              {latestNews.map((item) => (
                <Link key={item.id} href={`/admin/collections/news/${item.id}`} className="a-news-card">
                  <span className="a-news-cover">
                    {item.cover_url ? (
                      <img src={item.cover_url} alt="" loading="lazy" />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </span>
                  <span className="a-news-body">
                    <b>{pick(item, 'title', 'ar')}</b>
                    <small>{formatDate(item.published_at)}</small>
                  </span>
                  <span className={`badge ${item.is_published ? 'live' : 'hidden'}`}>
                    {item.is_published ? 'منشور' : 'مخفي'}
                  </span>
                  <ArrowUpRight size={15} className="a-news-go" />
                </Link>
              ))}
            </div>
            {!latestNews.length ? <div className="empty-state">لا توجد أخبار منشورة بعد.</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
