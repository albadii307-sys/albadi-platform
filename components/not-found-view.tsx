import Link from 'next/link';

export default function NotFoundView() {
  return (
    <section className="section" style={{ minHeight: '62vh', display: 'grid', placeItems: 'center' }}>
      <div className="container" style={{ maxWidth: 640, textAlign: 'center' }}>
        <img
          src="/media/brand/logo.png"
          alt="مجموعة البادي"
          width={375}
          height={63}
          style={{ height: 52, width: 'auto', marginInline: 'auto' }}
        />
        <p className="eyebrow" style={{ justifyContent: 'center', marginTop: 26 }}>
          404
        </p>
        <h1 className="section-title" style={{ marginTop: 8 }}>
          الصفحة غير موجودة
        </h1>
        <p className="section-text" style={{ marginInline: 'auto' }}>
          ربما تم نقل الصفحة أو تغيير رابطها. يمكنك العودة إلى الصفحة الرئيسية أو التواصل معنا مباشرة.
          <br />
          <span dir="ltr">The page you are looking for could not be found.</span>
        </p>
        <div
          className="hero-actions"
          style={{ justifyContent: 'center', marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 12 }}
        >
          <Link href="/ar" className="btn btn-dark">
            الرئيسية
          </Link>
          <Link href="/en" className="btn btn-ghost">
            English home
          </Link>
          <Link href="/ar/contact" className="btn btn-orange">
            تواصل معنا
          </Link>
        </div>
      </div>
    </section>
  );
}
