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

        <div className="panel">
          {rows.length ? (
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
                {rows.map((request) => (
                  <tr key={request.id}>
                    <td dir="ltr" style={{ fontFamily: 'monospace', fontSize: '0.76rem' }}>
                      {request.ref}
                    </td>
                    <td>
                      <div className="row-title">{request.service_name ?? '—'}</div>
                      {request.message ? <div className="row-sub">{request.message.slice(0, 70)}…</div> : null}
                    </td>
                    <td>
                      <div className="row-title">{request.name}</div>
                      <div className="row-sub" dir="ltr">
                        {request.phone}
                      </div>
                    </td>
                    <td>
                      <span className={`badge status-${request.status}`}>
                        {requestStatuses.find((s) => s.value === request.status)?.label}
                      </span>
                    </td>
                    <td className="row-sub">{fmt(request.created_at)}</td>
                    <td style={{ textAlign: 'end' }}>
                      <Link href={`/admin/requests/${request.id}`} className="a-btn">
                        تفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">لا توجد طلبات في هذه الحالة.</div>
          )}
        </div>
      </div>
    </>
  );
}
