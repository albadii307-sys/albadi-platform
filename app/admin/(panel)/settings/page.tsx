import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/db';
import { getSiteSettings } from '@/lib/site-settings.server';
import { Award, Check, Clock, ImageIcon, Upload, X } from '@/components/icons';
import { saveSiteContent } from '@/app/admin/actions';

const socialFields = [
  { key: 'instagram', label: 'Instagram', hint: 'https://www.instagram.com/…' },
  { key: 'x', label: 'X (Twitter)', hint: 'https://x.com/…' },
  { key: 'linkedin', label: 'LinkedIn', hint: 'https://www.linkedin.com/company/…' },
  { key: 'facebook', label: 'Facebook', hint: 'https://www.facebook.com/…' },
  { key: 'youtube', label: 'YouTube', hint: 'https://www.youtube.com/@…' },
  { key: 'whatsapp', label: 'WhatsApp', hint: '+968 …' },
] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings = await getSiteSettings();

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
        <h1>إعدادات الموقع</h1>
        <span className="crumb">الهوية وبيانات التواصل والتواصل الاجتماعي ومحتوى الصفحات</span>
      </div>
      <div className="admin-content">
        {saved ? <div className="alert-admin">تم حفظ الإعدادات وتحديث الموقع. افتح الموقع للتأكد من الترويسة والتذييل.</div> : null}

        <form action={saveSiteContent} className="a-form settings-form">
          <div className="panel">
            <div className="panel-head">
              <h2>هوية الشركة</h2>
              <span className="row-sub">الاسم والشعار يظهران في الترويسة والتذييل وقائمة الجوال</span>
            </div>
            <div className="panel-body">
              <div className="brand-setting">
                <div className="brand-setting-preview">
                  <span className="row-sub">الشعار الحالي</span>
                  <div className="brand-setting-tile">
                    <img src={settings.logo} alt="شعار الشركة الحالي" />
                  </div>
                  <span className="row-sub" dir="ltr">
                    {settings.logo}
                  </span>
                </div>
                <div className="a-grid-2">
                  <div className="a-field">
                    <label htmlFor="brand_name_ar">اسم الشركة (عربي)</label>
                    <input id="brand_name_ar" name="brand_name_ar" defaultValue={settings.brandNameAr} />
                  </div>
                  <div className="a-field">
                    <label htmlFor="brand_name_en">اسم الشركة (إنجليزي)</label>
                    <input id="brand_name_en" name="brand_name_en" defaultValue={settings.brandNameEn} dir="ltr" />
                  </div>
                  <div className="a-field">
                    <label htmlFor="brand_tagline_ar">الوصف القصير (عربي)</label>
                    <input id="brand_tagline_ar" name="brand_tagline_ar" defaultValue={settings.taglineAr} />
                  </div>
                  <div className="a-field">
                    <label htmlFor="brand_tagline_en">الوصف القصير (إنجليزي)</label>
                    <input id="brand_tagline_en" name="brand_tagline_en" defaultValue={settings.taglineEn} dir="ltr" />
                  </div>
                  <div className="a-field">
                    <label htmlFor="logo_url">رابط الشعار</label>
                    <input id="logo_url" name="logo_url" defaultValue={settings.logo} dir="ltr" placeholder="/media/brand/logo.png" />
                    <span className="a-help">مسار داخلي أو رابط صورة مباشر (PNG أو SVG بخلفية شفافة).</span>
                  </div>
                  <div className="a-field">
                    <label htmlFor="logo_file">أو ارفع شعاراً جديداً</label>
                    <input id="logo_file" name="logo_file" type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" />
                    <span className="a-help">PNG أو SVG أو WebP — بحد أقصى 8 ميجابايت. يُستبدل الرابط تلقائياً بعد الرفع.</span>
                  </div>
                </div>
              </div>
              <label className="brand-reset">
                <input type="checkbox" name="reset_logo" />
                استعادة الشعار الافتراضي عند الحفظ
              </label>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>بيانات التواصل</h2>
              <span className="row-sub">تظهر في التذييل وصفحة التواصل وترويسة الجوال</span>
            </div>
            <div className="panel-body">
              <div className="a-grid-2">
                <div className="a-field">
                  <label htmlFor="contact_phone">الهاتف</label>
                  <input id="contact_phone" name="contact_phone" defaultValue={settings.phone} dir="ltr" />
                </div>
                <div className="a-field">
                  <label htmlFor="contact_fax">الفاكس</label>
                  <input id="contact_fax" name="contact_fax" defaultValue={settings.fax} dir="ltr" />
                </div>
                <div className="a-field">
                  <label htmlFor="contact_email">البريد الإلكتروني</label>
                  <input id="contact_email" name="contact_email" defaultValue={settings.email} dir="ltr" />
                </div>
                <div className="a-field">
                  <label htmlFor="contact_address_ar">العنوان (عربي)</label>
                  <input id="contact_address_ar" name="contact_address_ar" defaultValue={settings.addressAr} />
                </div>
                <div className="a-field">
                  <label htmlFor="contact_address_en">العنوان (إنجليزي)</label>
                  <input id="contact_address_en" name="contact_address_en" defaultValue={settings.addressEn} dir="ltr" />
                </div>
                <div className="a-field">
                  <label htmlFor="contact_hours_ar">ساعات العمل (عربي)</label>
                  <input id="contact_hours_ar" name="contact_hours_ar" defaultValue={settings.hoursAr} />
                </div>
                <div className="a-field">
                  <label htmlFor="contact_hours_en">ساعات العمل (إنجليزي)</label>
                  <input id="contact_hours_en" name="contact_hours_en" defaultValue={settings.hoursEn} dir="ltr" />
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>التواصل الاجتماعي</h2>
              <span className="row-sub">أضف الرابط ليظهر الأيقونة في الموقع — الحقل الفارغ يُخفي الأيقونة.</span>
            </div>
            <div className="panel-body">
              <div className="a-grid-2">
                {socialFields.map((social) => (
                  <div className="a-field" key={social.key}>
                    <label htmlFor={`social_${social.key}`}>{social.label}</label>
                    <input
                      id={`social_${social.key}`}
                      name={`social_${social.key}`}
                      defaultValue={settings.social[social.key]}
                      dir="ltr"
                      placeholder={social.hint}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>محتوى الصفحة الرئيسية</h2>
              <span className="row-sub">لكل قسم قائمة مستقلة مع نافذة تعديل منبثقة</span>
            </div>
            <div className="panel-body">
              <div className="a-linkgrid">
                <Link href="/admin/content/why" className="a-linkcard">
                  <Award size={20} />
                  <b>لماذا مجموعة البادي</b>
                  <span>{settings.why.length} بطاقة — الأيقونة تُختار من داخل النافذة</span>
                </Link>
                <Link href="/admin/content/timeline" className="a-linkcard">
                  <Clock size={20} />
                  <b>محطات من مسيرتنا</b>
                  <span>{settings.timeline.length} محطة — تظهر في الرئيسية وعن المجموعة</span>
                </Link>
                <Link href="/admin/galleries" className="a-linkcard">
                  <ImageIcon size={20} />
                  <b>صور أعمال القطاعات</b>
                  <span>أضف عدة صور لكل قطاع</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="a-savebar">
            <span className="row-sub">تُطبّق التغييرات على الموقع بمجرد الحفظ.</span>
            <button type="submit" className="a-btn primary">
              <Upload size={15} /> حفظ كل الإعدادات
            </button>
          </div>
        </form>

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
