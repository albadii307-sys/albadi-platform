import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/db';
import { getSiteSettings } from '@/lib/site-settings.server';
import { Award, Check, Clock, ImageIcon, Upload, X } from '@/components/icons';
import { saveSiteContent } from '@/app/admin/actions';
import { fontOptions } from '@/lib/site-settings';

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
              <h2>فيديو الواجهة الرئيسية</h2>
              <span className="row-sub">اختياري — عند تركه فارغاً يبقى عرض الصور المتحرك في أعلى الرئيسية</span>
            </div>
            <div className="panel-body">
              <div className="a-field">
                <label htmlFor="hero_video_url">رابط الفيديو (MP4 أو WebM)</label>
                <input
                  id="hero_video_url"
                  name="hero_video_url"
                  defaultValue={settings.heroVideo}
                  dir="ltr"
                  placeholder="https://…/hero.mp4 أو /media/hero/hero.mp4"
                />
                <span className="a-help">
                  مسار داخلي أو رابط مباشر. يُشغَّل تلقائياً بدون صوت مع تكرار، ويُستبدل بعرض الصور لمن يفعّل تقليل
                  الحركة في جهازه.
                </span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>الخطوط وتنسيق النص</h2>
              <span className="row-sub">تُطبَّق على الموقع العام بالكامل — أما محتوى الصفحات فيُنسَّق من محرّر النص</span>
            </div>
            <div className="panel-body">
              {(() => {
                const typo = settings.typography;
                const bodyFont = fontOptions.find((font) => font.key === typo.bodyFont) ?? fontOptions[0];
                const headingFont = fontOptions.find((font) => font.key === typo.headingFont) ?? fontOptions[0];
                return (
                  <>
                    <div className="a-grid-2">
                      <div className="a-field">
                        <label htmlFor="type_body_font">خط النصوص</label>
                        <select id="type_body_font" name="type_body_font" defaultValue={typo.bodyFont}>
                          {fontOptions.map((font) => (
                            <option key={font.key} value={font.key}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="a-field">
                        <label htmlFor="type_heading_font">خط العناوين</label>
                        <select id="type_heading_font" name="type_heading_font" defaultValue={typo.headingFont}>
                          {fontOptions.map((font) => (
                            <option key={font.key} value={font.key}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="a-field">
                        <label htmlFor="type_base_size">حجم النص الأساسي (px)</label>
                        <input
                          id="type_base_size"
                          name="type_base_size"
                          type="number"
                          min={14}
                          max={20}
                          step={1}
                          defaultValue={typo.baseSize}
                        />
                        <span className="a-help">14–20 بكسل — يكبّر أو يصغّر كل نصوص الموقع المبنية على وحدة rem.</span>
                      </div>
                      <div className="a-field">
                        <label htmlFor="type_line_height">ارتفاع السطر</label>
                        <select id="type_line_height" name="type_line_height" defaultValue={String(typo.lineHeight)}>
                          {['1.3', '1.4', '1.5', '1.6', '1.7', '1.75', '1.8', '1.9', '2', '2.1', '2.2'].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="a-field">
                        <label htmlFor="type_letter_spacing">تباعد الحروف (px)</label>
                        <input
                          id="type_letter_spacing"
                          name="type_letter_spacing"
                          type="number"
                          min={-1}
                          max={3}
                          step={0.5}
                          defaultValue={typo.letterSpacing}
                        />
                        <span className="a-help">القيمة السالبة تضغط الحروف، والموجبة توسّعها.</span>
                      </div>
                      <div className="a-field">
                        <label htmlFor="type_heading_weight">سماكة العناوين</label>
                        <select id="type_heading_weight" name="type_heading_weight" defaultValue={String(typo.headingWeight)}>
                          {[400, 500, 600, 700, 800].map((weight) => (
                            <option key={weight} value={weight}>
                              {weight}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="type-preview">
                      <span className="row-sub">معاينة الخط الحالي</span>
                      <b style={{ fontFamily: headingFont.stack, fontWeight: typo.headingWeight }}>
                        نبني عُمان منذ 1976
                      </b>
                      <p style={{ fontFamily: bodyFont.stack, lineHeight: typo.lineHeight, letterSpacing: typo.letterSpacing }}>
                        مجموعة عُمانية متعددة الأنشطة، تعمل في المقاولات والصناعة والتجارة والتعليم والضيافة بقيادة كوادر
                        عُمانية.
                      </p>
                      <small style={{ fontFamily: bodyFont.stack }}>Al-Badi Investment Holding Group — since 1976</small>
                    </div>
                    <p className="a-help">
                      لتغيير خط أو حجم أو لون جزء محدد داخل المحتوى، افتح أي عنصر فيه محرّر نص واحفظ التغييرات من الشريط
                      المنسدل.
                    </p>
                  </>
                );
              })()}
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
