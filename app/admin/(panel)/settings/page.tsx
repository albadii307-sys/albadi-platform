import { isSupabaseConfigured } from '@/lib/db';
import { getSiteLogo } from '@/lib/queries';
import { Check, Upload, X } from '@/components/icons';
import { saveCompanySettings } from '@/app/admin/actions';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const logo = await getSiteLogo();

  const rows = [
    { label: 'قاعدة البيانات', ok: isSupabaseConfigured, on: 'Supabase متصل', off: 'وضع المعاينة المحلي (.data/db.json)' },
    { label: 'إشعارات البريد', ok: Boolean(process.env.RESEND_API_KEY), on: 'Resend مُفعّل', off: 'غير مُفعّل — الطلبات تُسجّل فقط' },
    {
      label: 'حماية النماذج',
      ok: Boolean(process.env.TURNSTILE_SECRET_KEY),
      on: 'Turnstile مُفعّل',
      off: 'غير مُفعّل',
    },
    {
      label: 'بيئة التشغيل',
      ok: process.env.NODE_ENV === 'production',
      on: 'الإنتاج',
      off: 'التطوير المحلي',
    },
  ];

  return (
    <>
      <div className="admin-topbar">
        <h1>إعدادات الشركة</h1>
        <span className="crumb">الهوية وحالة النظام والتكاملات</span>
      </div>
      <div className="admin-content">
        {saved ? <div className="alert-admin">تم حفظ شعار الشركة، وسيظهر في ترويسة الموقع وتذييله بعد التحديث.</div> : null}

        <div className="panel">
          <div className="panel-head">
            <h2>شعار الشركة</h2>
            <span className="row-sub">يظهر في الترويسة والتذييل وقائمة الجوال</span>
          </div>
          <div className="panel-body">
            <div className="brand-setting">
              <div className="brand-setting-preview">
                <span className="row-sub">الشعار الحالي</span>
                <div className="brand-setting-tile">
                  <img src={logo} alt="شعار الشركة الحالي" />
                </div>
                <span className="row-sub" dir="ltr">
                  {logo}
                </span>
              </div>

              <form action={saveCompanySettings} className="a-form brand-setting-form">
                <div className="a-field">
                  <label htmlFor="logo_url">رابط الشعار</label>
                  <input
                    id="logo_url"
                    name="logo_url"
                    defaultValue={logo}
                    dir="ltr"
                    placeholder="/media/brand/logo.png"
                  />
                  <span className="a-help">مسار داخلي أو رابط صورة مباشر (PNG أو SVG بخلفية شفافة).</span>
                </div>
                <div className="a-field">
                  <label htmlFor="logo_file">أو ارفع شعاراً جديداً</label>
                  <input id="logo_file" name="logo_file" type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" />
                  <span className="a-help">PNG أو SVG أو WebP — بحد أقصى 8 ميجابايت. يُستبدل الرابط تلقائياً بعد الرفع.</span>
                </div>
                <label className="brand-reset">
                  <input type="checkbox" name="reset_logo" />
                  استعادة الشعار الافتراضي عند الحفظ
                </label>
                <button type="submit" className="a-btn primary" style={{ justifySelf: 'start' }}>
                  <Upload size={15} /> حفظ الشعار
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>حالة التكاملات</h2>
          </div>
          <table className="a-table">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="row-title" style={{ width: 200 }}>
                    {row.label}
                  </td>
                  <td>
                    <span className={`badge ${row.ok ? 'live' : 'hidden'}`} style={{ gap: 6 }}>
                      {row.ok ? <Check size={13} /> : <X size={13} />}
                      {row.ok ? row.on : row.off}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>ربط Supabase</h2>
          </div>
          <div className="panel-body" style={{ fontSize: '0.86rem', lineHeight: 1.9 }}>
            <p>لتفعيل قاعدة البيانات السحابية:</p>
            <ol style={{ paddingInlineStart: 20, margin: '8px 0 16px' }}>
              <li>أنشئ مشروعاً على supabase.com</li>
              <li>نفّذ ملف <code dir="ltr">supabase/schema.sql</code> في SQL Editor</li>
              <li>
                أضف المفاتيح في <code dir="ltr">.env.local</code>:
                <pre
                  dir="ltr"
                  style={{ background: '#0a3222', color: '#d7f5e3', padding: 14, borderRadius: 10, overflowX: 'auto', fontSize: '0.78rem', marginTop: 8 }}
                >{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...`}</pre>
              </li>
              <li>أنشئ مستخدم المدير من Authentication ثم أضف دوره في جدول profiles</li>
            </ol>
            <p style={{ color: 'var(--muted)' }}>
              الأدوار: <b>مدير</b> (كل الصلاحيات) · <b>محرر</b> (المحتوى) · <b>مسؤول طلبات</b> (الطلبات فقط).
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>معلومات الموقع</h2>
          </div>
          <div className="panel-body">
            <div className="kv">
              <div>
                <b>رابط الموقع</b>
                <span dir="ltr">{process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}</span>
              </div>
              <div>
                <b>بريد استلام الطلبات</b>
                <span dir="ltr">{process.env.REQUESTS_NOTIFY_EMAIL ?? 'albadi@albadigroup.com'}</span>
              </div>
              <div>
                <b>اللغات</b>
                <span>العربية (افتراضي) · English</span>
              </div>
              <div>
                <b>القطاعات المنشورة</b>
                <span>تُدار من صفحة القطاعات</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
