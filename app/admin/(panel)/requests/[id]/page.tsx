import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requestStatuses } from '@/lib/collections';
import { getRequest } from '@/lib/queries';
import { updateRequest } from '@/app/admin/actions';
import { ArrowLeft, Download, Mail, Phone } from '@/components/icons';

const fmt = (value: string) =>
  new Intl.DateTimeFormat('ar-OM-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();

  return (
    <>
      <div className="admin-topbar">
        <h1>طلب {request.ref}</h1>
        <Link href="/admin/requests" className="a-btn">
          <ArrowLeft size={15} /> كل الطلبات
        </Link>
      </div>
      <div className="admin-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span className={`badge status-${request.status}`} style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
            {requestStatuses.find((s) => s.value === request.status)?.label}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>أُنشئ في {fmt(request.created_at)}</span>
        </div>

        <div className="req-grid">
          <div>
            <div className="panel">
              <div className="panel-head">
                <h2>بيانات العميل</h2>
              </div>
              <div className="panel-body">
                <div className="kv">
                  <div>
                    <b>الاسم</b>
                    <span>{request.name}</span>
                  </div>
                  <div>
                    <b>الشركة</b>
                    <span>{request.company ?? '—'}</span>
                  </div>
                  <div>
                    <b>الهاتف</b>
                    <a href={`tel:${request.phone}`} dir="ltr">
                      {request.phone}
                    </a>
                  </div>
                  <div>
                    <b>البريد</b>
                    <a href={`mailto:${request.email}`} dir="ltr">
                      {request.email}
                    </a>
                  </div>
                  <div>
                    <b>الخدمة</b>
                    <span>{request.service_name ?? '—'}</span>
                  </div>
                  <div>
                    <b>اللغة</b>
                    <span>{request.locale === 'ar' ? 'العربية' : 'English'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                  <a className="a-btn" href={`tel:${request.phone}`}>
                    <Phone size={15} /> اتصال
                  </a>
                  <a className="a-btn" href={`mailto:${request.email}?subject=رد%20على%20طلب%20${request.ref}`}>
                    <Mail size={15} /> رد بالبريد
                  </a>
                  {request.attachment_url ? (
                    <a className="a-btn" href={request.attachment_url} target="_blank" rel="noopener noreferrer">
                      <Download size={15} /> المرفق
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>تفاصيل الطلب</h2>
              </div>
              <div className="panel-body">
                <div className="req-message">{request.message ?? '—'}</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>متابعة الطلب</h2>
            </div>
            <div className="panel-body">
              <form action={updateRequest.bind(null, request.id)} className="a-form">
                <div className="a-field">
                  <label htmlFor="status">الحالة</label>
                  <select id="status" name="status" defaultValue={request.status}>
                    {requestStatuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="a-field">
                  <label htmlFor="assignee">المسؤول</label>
                  <input id="assignee" name="assignee" defaultValue={request.assignee ?? ''} placeholder="اسم الموظف" />
                </div>
                <div className="a-field">
                  <label htmlFor="notes">ملاحظات داخلية</label>
                  <textarea id="notes" name="notes" defaultValue={request.notes ?? ''} rows={6} />
                </div>
                <button type="submit" className="a-btn primary" style={{ justifyContent: 'center' }}>
                  حفظ التحديث
                </button>
              </form>

              <div className="kv" style={{ marginTop: 20 }}>
                <div>
                  <b>رقم الطلب</b>
                  <span dir="ltr">{request.ref}</span>
                </div>
                <div>
                  <b>آخر تحديث</b>
                  <span>{fmt(request.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
