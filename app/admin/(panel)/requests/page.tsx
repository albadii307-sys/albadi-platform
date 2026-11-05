import Link from 'next/link';
import { requestStatuses } from '@/lib/collections';
import { getRequests } from '@/lib/queries';

const fmt = (value: string) =>
  new Intl.DateTimeFormat('ar-OM-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(value)
  );

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await getRequests();
  const rows = status ? all.filter((request) => request.status === status) : all;
  const counts = (value: string) => all.filter((request) => request.status === value).length;

  return (
    <>
      <div className="admin-topbar">
        <h1>طلبات الخدمات</h1>
        <span className="crumb">{all.length} طلب</span>
      </div>
      <div className="admin-content">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <Link href="/admin/requests" className={`a-btn ${!status ? 'primary' : ''}`}>
            الكل ({all.length})
          </Link>
          {requestStatuses.map((item) => (
            <Link
              key={item.value}
              href={`/admin/requests?status=${item.value}`}
              className={`a-btn ${status === item.value ? 'primary' : ''}`}
            >
              {item.label} ({counts(item.value)})
            </Link>
          ))}
        </div>

        {rows.length ? (
          <div className="a-cardgrid">
            {rows.map((request) => (
              <article className="a-card" key={request.id}>
                <div className="a-card-body">
                  <div className="a-card-top">
                    <h3 dir="ltr" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {request.ref}
                    </h3>
                    <span className={`badge status-${request.status}`}>
                      {requestStatuses.find((s) => s.value === request.status)?.label}
                    </span>
                  </div>
                  <div className="req-card-main">
                    <b>{request.service_name ?? '—'}</b>
                    {request.message ? <p className="row-sub">{request.message.slice(0, 90)}…</p> : null}
                  </div>
                  <dl className="a-card-meta">
                    <div>
                      <dt>العميل</dt>
                      <dd>{request.name}</dd>
                    </div>
                    <div>
                      <dt>الهاتف</dt>
                      <dd dir="ltr">
                        {request.phone}
                      </dd>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <dt>التاريخ</dt>
                      <dd>{fmt(request.created_at)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="a-card-actions">
                  <span className="row-sub">{request.email ?? '—'}</span>
                  <Link href={`/admin/requests/${request.id}`} className="a-btn ghost small">
                    تفاصيل الطلب
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel">
            <div className="empty-state">لا توجد طلبات في هذه الحالة.</div>
          </div>
        )}
      </div>
    </>
  );
}
