import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getDict, pick, type Locale } from '@/lib/i18n';
import { getCompanies, getNews, getProjects, getSectors, getServices, getTeam } from '@/lib/queries';
import { companiesCount, enginesCount, sectorsCount } from '@/lib/plural';
import { NewsCard } from '@/components/cards';
import HeroMedia from '@/components/hero-media';
import SectorShowcase from '@/components/sector-showcase';
import { CompanyCard } from '@/components/company-grid';
import { TeamCard } from '@/components/team-grid';
import NewsRail, { Rail } from '@/components/news-rail';
import ServicesIndex, { type ServiceGroupItem } from '@/components/services-index';
import SiteMap from '@/components/site-map';
import Timeline from '@/components/timeline';
import WhySection from '@/components/why-section';
import { Counter, LiveClock } from '@/components/x-motion';
import { getSiteSettings } from '@/lib/site-settings.server';
import { siteAddress, siteHours, telHref } from '@/lib/site-settings';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, Mail, Pin, Phone } from '@/components/icons';

const SECTOR_MEDIA: Record<string, { image: string; logo?: string }> = {
  contracting: { image: '/media/projects/p5.webp', logo: '/media/companies/co-contracting.webp' },
  'real-estate-development': { image: '/media/projects/p4.webp' },
  logistics: { image: '/media/projects/p7.webp' },
  'trade-services': { image: '/media/projects/p9.webp', logo: '/media/companies/co-trade.webp' },
  'hospitality-tourism': { image: '/media/csr/c2.webp', logo: '/media/companies/co-hotel.webp' },
  education: { image: '/media/projects/p2.webp', logo: '/media/companies/co-school.webp' },
  'energy-mining': { image: '/media/projects/p8.webp', logo: '/media/companies/co-mining.webp' },
  investment: { image: '/media/projects/p3.webp' },
  industry: { image: '/media/projects/p1.webp', logo: '/media/companies/co-aluminium.webp' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.seo.homeTitle,
    description: t.seo.homeDesc,
    alternates: { canonical: `/${l}`, languages: { ar: '/ar', en: '/en' } },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const ar = locale === 'ar';

  const [sectors, companies, projects, news, services, team, settings] = await Promise.all([
    getSectors(),
    getCompanies(),
    getProjects(true, 3),
    getNews('group', 5),
    getServices(),
    getTeam(),
    getSiteSettings(),
  ]);

  const serviceCount = new Map<string, number>();
  for (const service of services) {
    if (!service.sector_id) continue;
    serviceCount.set(service.sector_id, (serviceCount.get(service.sector_id) ?? 0) + 1);
  }

  const showcase = sectors.map((sector) => ({
    id: sector.id,
    slug: sector.slug,
    name: pick(sector, 'name', locale),
    tagline: pick(sector, 'tagline', locale) || pick(sector, 'summary', locale),
    services: serviceCount.get(sector.id) ?? 0,
    image: SECTOR_MEDIA[sector.slug]?.image ?? '/media/projects/p4.webp',
    logo: SECTOR_MEDIA[sector.slug]?.logo ?? null,
  }));

  const companyItems = companies.map((company) => {
    const sector = sectors.find((item) => item.id === company.sector_id);
    return {
      id: company.id,
      slug: company.slug,
      name: pick(company, 'name', locale),
      description: pick(company, 'description', locale),
      sector: sector ? pick(sector, 'name', locale) : '',
      sectorSlug: sector?.slug ?? '',
      website: company.website,
      logo: company.logo_url,
      photo: sector ? SECTOR_MEDIA[sector.slug]?.image ?? null : null,
    };
  });

  const serviceGroups: ServiceGroupItem[] = sectors
    .map((sector) => ({
      id: sector.id,
      slug: sector.slug,
      name: pick(sector, 'name', locale),
      services: services
        .filter((service) => service.sector_id === sector.id)
        .map((service) => ({
          id: service.id,
          name: pick(service, 'name', locale),
          summary: pick(service, 'summary', locale),
        })),
    }))
    .filter((group) => group.services.length > 0);

  const teamItems = team.map((member, index) => ({
    id: member.id,
    name: pick(member, 'name', locale),
    role: pick(member, 'role', locale),
    bio: pick(member, 'bio', locale) || null,
    photo: member.photo_url,
    order: index + 1,
  }));

  const stats = [
    { value: 1976, label: t.home.stats[0].label, scramble: true },
    { value: sectors.length, label: t.home.stats[1].label },
    { value: companies.length, label: t.home.stats[2].label },
    { value: new Date().getFullYear() - 1976, label: t.home.stats[3].label },
  ];

  const heroLines = ar ? ['نبني عُمان', 'منذ'] : ['Building Oman', 'since'];
  const heroSlides = [
    { src: '/media/hero/hero-1.webp', label: ar ? 'مشاريع المقاولات والبناء' : 'Contracting & construction' },
    { src: '/media/hero/hero-2.webp', label: ar ? 'مجمعات ومبانٍ حكومية' : 'Government complexes' },
    { src: '/media/hero/hero-3.webp', label: ar ? 'الطرق والبنية الأساسية' : 'Roads & infrastructure' },
    { src: '/media/hero/hero-4.webp', label: ar ? 'التعدين والمحاجر' : 'Mining & quarries' },
  ];
  const quote = ar
    ? '«أول نشاط تجاري سُجل عام 1976، ومنذ ذلك الحين تواصل المجموعة بناء عُمان بكفاءات عُمانية — حتى بلغت نسبة التعمين في بعض الإدارات 100%.»'
    : '“Our first commercial activity was registered in 1976. Since then we have kept building Oman with Omani talent — reaching 100% Omanisation in some departments.”';

  return (
    <div className="x-home">
      <section className="x-hero">
        <HeroMedia slides={heroSlides} />
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
          <span className="x-hero-rings r1" />
          <span className="x-hero-rings r2" />
        </div>

        <div className="container x-hero-inner">
          <div className="x-hero-meta">
            <span className="x-pill">
              <i aria-hidden="true" />
              {t.home.heroBadge}
            </span>
            <span className="x-hero-loc">
              {t.home.extra.location}
              <LiveClock />
            </span>
          </div>

          <h1 className="x-hero-title">
            <span className="x-line">
              <span>{heroLines[0]}</span>
            </span>
            <span className="x-line x-line-accent">
              <span>
                {heroLines[1]}{' '}
                <em>
                  <Counter value={1976} scramble className="x-year" />
                  <i aria-hidden="true">.</i>
                </em>
              </span>
            </span>
          </h1>

          <div className="x-hero-foot">
            <p>{t.home.heroText}</p>
            <div className="x-hero-actions">
              <a href="#sectors" className="x-btn x-btn-accent">
                <span>{t.home.heroCta}</span>
                <Arrow size={17} />
              </a>
              <Link href={`/${locale}/request`} className="x-btn x-btn-ghost">
                {t.home.heroCta2}
              </Link>
            </div>
          </div>

          <span className="x-scroll-cue" aria-hidden="true">
            <i />
            {t.home.extra.scroll}
          </span>
        </div>

        <div className="x-hero-belt">
          <div className="x-marquee" dir="ltr">
            <div className="x-marquee-track">
              {[0, 1].map((copy) => (
                <div className="x-marquee-group" key={copy} aria-hidden={copy === 1}>
                  {sectors.map((sector, index) => (
                    <Link
                      key={sector.id}
                      href={`/${locale}/sectors/${sector.slug}`}
                      dir={ar ? 'rtl' : 'ltr'}
                      tabIndex={copy === 1 ? -1 : undefined}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {pick(sector, 'name', locale)}
                      <i aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="x-intro" id="about">
        <div className="container">
          <div className="x-dock reveal">
            <div className="x-dock-head">
              <span>{t.home.extra.credentialsTitle}</span>
              <i aria-hidden="true" />
            </div>
            <div className="x-stats">
              {stats.map((stat) => (
                <div className="x-stat" key={stat.label}>
                  <span className="x-stat-num">
                    <Counter value={stat.value} scramble={stat.scramble} />
                  </span>
                  <span className="x-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="x-intro-grid">
            <div className="x-intro-media reveal">
              <div className="x-media-frame">
                <img
                  src="/media/brand/chairman.webp"
                  alt={t.home.extra.quoteBy}
                  loading="lazy"
                  data-parallax="0.035"
                />
              </div>
              <span className="x-year-stamp">
                <b>1976</b>
                <small>{ar ? 'سنة التأسيس' : 'Founded'}</small>
              </span>
            </div>

            <div className="x-intro-copy">
              <span className="x-eyebrow">
                <i aria-hidden="true" />
                {t.home.aboutTitle}
              </span>
              <h2 className="x-h2">
                {ar ? 'مجموعة واحدة.' : 'One group.'}
                <br />
                <em>
                  {ar
                    ? `${enginesCount(sectors.length, locale)} للنمو.`
                    : `${enginesCount(sectors.length, locale)} of growth.`}
                </em>
              </h2>
              <p className="x-lead">{t.home.aboutText}</p>

              <blockquote className="x-quote reveal">
                <span className="x-quote-mark" aria-hidden="true">
                  ”
                </span>
                <p>{quote}</p>
                <footer>{t.home.extra.quoteBy}</footer>
              </blockquote>

              <ul className="x-cred reveal">
                <li>
                  <Check size={17} />
                  {ar ? 'الدرجة الممتازة من مجلس المناقصات العُماني' : 'Excellent grade from Oman Tender Board'}
                </li>
                <li>
                  <Check size={17} />
                  {ar ? 'كوادر عُمانية وتعمين يتجاوز 90%' : 'Omani-led teams with 90%+ Omanisation'}
                </li>
                <li>
                  <Check size={17} />
                  {ar ? 'ترخيص الدرجة الممتازة من وزارة الدفاع' : 'Excellent rating from the Ministry of Defence'}
                </li>
              </ul>

              <Link href={`/${locale}/about`} className="x-link">
                {t.home.extra.storyLink} <Arrow size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <WhySection
        items={settings.why}
        locale={locale}
        eyebrow={ar ? 'لماذا مجموعة البادي' : 'Why Al-Badi'}
        title={ar ? 'ستة أسباب تجعلنا' : 'Six reasons we are'}
        accent={ar ? 'شريكك الموثوق.' : 'your trusted partner.'}
        lead={
          ar
            ? 'خبرة خمسة عقود، وقطاعات متكاملة، وكوادر عُمانية، ومعايير جودة معتمدة — هذا ما يجعل مجموعة البادي الخيار الأول لمشاريع عُمان.'
            : 'Five decades of experience, integrated sectors, Omani talent and certified quality — that is what makes Al-Badi the first choice for Oman’s projects.'
        }
      />

      <Timeline
        items={settings.timeline}
        locale={locale}
        eyebrow={ar ? 'محطات من مسيرتنا' : 'Milestones'}
        title={ar ? 'خمسة عقود من' : 'Five decades of'}
        accent={ar ? 'البناء والتوسّع.' : 'building and growth.'}
        lead={
          ar
            ? 'من أول نشاط تجاري عام 1976 إلى منظومة قطاعات متكاملة — هذه أبرز المحطات في مسيرة المجموعة.'
            : 'From the first commercial activity in 1976 to an integrated group of sectors — these are the milestones of our journey.'
        }
      />

      <section className="x-sectors" id="sectors">
        <div className="container">
          <div className="x-sec-head reveal">
            <div>
              <span className="x-eyebrow light">
                <i aria-hidden="true" />
                {t.nav.sectors}
              </span>
              <h2 className="x-h2">
                {`${sectorsCount(sectors.length, locale)}.`}
                <br />
                <em>{ar ? 'منظومة واحدة.' : 'One ecosystem.'}</em>
              </h2>
            </div>
            <p>{t.home.sectorsText}</p>
          </div>

          <SectorShowcase items={showcase} locale={locale} />

          <div className="x-sec-foot">
            <span className="x-hint">
              <i aria-hidden="true" />
              {t.home.extra.showcaseHint}
            </span>
            <Link href={`/${locale}/sectors`} className="x-link light">
              {t.common.viewAll} <Arrow size={16} />
            </Link>
          </div>
        </div>
      </section>

      {companyItems.length ? (
        <section className="x-companies" id="companies">
          <div className="container">
            <div className="x-sec-head reveal">
              <div>
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {t.nav.companies}
                </span>
                <h2 className="x-h2">
                  {ar ? 'شركات تحت' : 'Companies under'}
                  <br />
                  <em>{ar ? 'مظلة واحدة.' : 'one umbrella.'}</em>
                </h2>
              </div>
              <div className="x-co-head-side">
                <p>
                  {ar
                    ? `${companiesCount(companies.length, locale)} تعمل معاً لتغطية سلسلة القيمة كاملة — من التصميم والتنفيذ إلى التشغيل والخدمات.`
                    : `${companiesCount(companies.length, locale)} working together across the full value chain — from design and delivery to operations and services.`}
                </p>
                <Link href={`/${locale}/companies`} className="x-link">
                  {t.common.viewAll} <Arrow size={16} />
                </Link>
              </div>
            </div>

            <Rail
              locale={locale}
              hint={ar ? 'اسحب لاستكشاف شركات المجموعة' : 'Drag to explore the group companies'}
              prev={t.common.prev}
              next={t.common.next}
            >
              {companyItems.map((item, index) => (
                <CompanyCard key={item.id} item={item} index={index} locale={locale} />
              ))}
            </Rail>
          </div>
        </section>
      ) : null}

      {serviceGroups.length ? (
        <section className="x-services" id="services">
          <div className="container">
            <div className="x-sec-head reveal">
              <div>
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {t.nav.services}
                </span>
                <h2 className="x-h2">
                  {ar ? 'كل خدمة.' : 'Every service.'}
                  <br />
                  <em>{ar ? 'تحت سقف واحد.' : 'Under one roof.'}</em>
                </h2>
              </div>
              <div className="x-co-head-side">
                <p>
                  {ar
                    ? `${services.length} خدمة موزّعة على ${serviceGroups.length} قطاعات — اختر خدمتك وأرسل الطلب مباشرة إلى فريقنا.`
                    : `${services.length} services across ${serviceGroups.length} sectors — pick yours and send the request straight to our team.`}
                </p>
                <Link href={`/${locale}/request`} className="x-link">
                  {t.nav.request} <Arrow size={16} />
                </Link>
              </div>
            </div>

            <ServicesIndex
              groups={serviceGroups}
              locale={locale}
              viewLabel={ar ? 'عرض خدمات القطاع' : 'View sector services'}
            />
          </div>
        </section>
      ) : null}

      {teamItems.length ? (
        <section className="x-team" id="team">
          <div className="x-team-fx" aria-hidden="true">
            <span className="x-team-rings" />
            <span className="x-team-glow" />
          </div>
          <div className="container">
            <div className="x-sec-head reveal">
              <div>
                <span className="x-eyebrow light">
                  <i aria-hidden="true" />
                  {ar ? 'فريق العمل' : 'Our team'}
                </span>
                <h2 className="x-h2">
                  {ar ? 'القيادة التي' : 'The leadership'}
                  <br />
                  <em>{ar ? 'تحمل الأمانة.' : 'behind the group.'}</em>
                </h2>
              </div>
              <p>
                {ar
                  ? 'منذ 1976 تُدار المجموعة بقيادة عُمانية تجمع بين خبرة العقود ورؤية واضحة لما هو قادم.'
                  : 'Since 1976 the group has been led by Omani leadership that pairs decades of experience with a clear view of what comes next.'}
              </p>
            </div>

            <Rail
              locale={locale}
              tone="dark"
              hint={ar ? 'اسحب للتعرّف على قيادة المجموعة' : 'Drag to meet the group leadership'}
              prev={t.common.prev}
              next={t.common.next}
            >
              {teamItems.map((member) => (
                <TeamCard key={member.id} member={member} locale={locale} />
              ))}
            </Rail>

            <div className="x-sec-foot">
              <span className="x-hint">
                <i aria-hidden="true" />
                {ar ? 'قصتنا منذ 1976' : 'Our story since 1976'}
              </span>
              <Link href={`/${locale}/about`} className="x-link light">
                {t.nav.about} <Arrow size={16} />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="x-projects" id="projects">
        <div className="container">
          <div className="x-sec-head reveal">
            <div>
              <span className="x-eyebrow">
                <i aria-hidden="true" />
                {t.nav.projects}
              </span>
              <h2 className="x-h2">
                {ar ? 'مبانٍ تروي' : 'Buildings that tell'}
                <br />
                <em>{ar ? 'مسيرتنا.' : 'our story.'}</em>
              </h2>
            </div>
            <p>{t.home.extra.projectsHint}</p>
          </div>

          <div className="x-gallery">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/${locale}/projects/${project.slug}`}
                className={`x-work reveal${index === 0 ? ' is-lead' : ''}`}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <span className="x-work-media">
                  {project.cover_url ? (
                    <img src={project.cover_url} alt={pick(project, 'title', locale)} loading="lazy" data-parallax="0.04" />
                  ) : null}
                  <span className="x-work-view" aria-hidden="true">
                    {ar ? 'عرض المشروع' : 'View project'} <ArrowUpRight size={16} />
                  </span>
                  {project.year ? <span className="x-work-year">{project.year}</span> : null}
                </span>
                <span className="x-work-body">
                  <b>{pick(project, 'title', locale)}</b>
                  <small>
                    {project.location_ar ? (
                      <span>
                        <Pin size={13} /> {pick(project, 'location', locale)}
                      </span>
                    ) : null}
                    {project.client_ar ? <span>{pick(project, 'client', locale)}</span> : null}
                  </small>
                </span>
              </Link>
            ))}
          </div>

          <div className="x-center">
            <Link href={`/${locale}/projects`} className="x-btn x-btn-outline">
              {t.common.viewAll} <Arrow size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="x-news" id="news">
        <div className="container">
          <div className="x-sec-head reveal">
            <div>
              <span className="x-eyebrow">
                <i aria-hidden="true" />
                {t.nav.news}
              </span>
              <h2 className="x-h2">
                {ar ? 'آخر' : 'Latest'}
                <br />
                <em>{ar ? 'المستجدات.' : 'updates.'}</em>
              </h2>
            </div>
            <Link href={`/${locale}/news`} className="x-link">
              {t.common.viewAll} <Arrow size={16} />
            </Link>
          </div>

          <NewsRail locale={locale} hint={t.home.extra.newsHint} prev={t.common.prev} next={t.common.next}>
            {news.map((item) => (
              <NewsCard key={item.id} item={item} locale={locale} reveal={false} />
            ))}
          </NewsRail>
        </div>
      </section>

      <section className="x-loc" id="location">
        <div className="container x-loc-grid">
          <div className="x-loc-copy reveal">
            <span className="x-eyebrow">
              <i aria-hidden="true" />
              {ar ? 'موقعنا' : 'Our location'}
            </span>
            <h2 className="x-h2">
              {ar ? 'مقرّنا في' : 'Rooted in'}
              <br />
              <em>{ar ? 'صحم، عُمان.' : 'Saham, Oman.'}</em>
            </h2>
            <p>
              {ar
                ? 'من ولاية صحم انطلقت المجموعة عام 1976، وما زال المقر الرئيسي هناك — قريباً من القطاعات والمشاريع التي نخدمها.'
                : 'The group started in Saham in 1976, and the head office remains there — close to the sectors and projects we serve.'}
            </p>

            <ul className="x-loc-rows">
              <li>
                <span className="x-loc-ic">
                  <Pin size={17} />
                </span>
                <div>
                  <b>{t.contact.address}</b>
                  <span>{siteAddress(locale, settings)}</span>
                </div>
              </li>
              <li>
                <span className="x-loc-ic">
                  <Phone size={17} />
                </span>
                <div>
                  <b>{t.contact.phone}</b>
                  <a href={telHref(settings.phone)} dir="ltr">
                    {settings.phone}
                  </a>
                </div>
              </li>
              <li>
                <span className="x-loc-ic">
                  <Mail size={17} />
                </span>
                <div>
                  <b>{t.contact.email}</b>
                  <a href={`mailto:${settings.email}`} dir="ltr">
                    {settings.email}
                  </a>
                </div>
              </li>
              <li>
                <span className="x-loc-ic">
                  <Clock size={17} />
                </span>
                <div>
                  <b>{t.contact.hours}</b>
                  <span>{siteHours(locale, settings)}</span>
                </div>
              </li>
            </ul>

            <Link href={`/${locale}/contact`} className="x-link">
              {t.nav.contact} <Arrow size={16} />
            </Link>
          </div>

          <SiteMap locale={locale} />
        </div>
      </section>

      <section className="x-request" id="request">
        <span className="x-request-glow" aria-hidden="true" />
        <div className="container x-request-grid">
          <div className="x-request-copy reveal">
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {t.nav.request}
            </span>
            <h2 className="x-h2">
              {ar ? 'فكرتك.' : 'Your idea.'}
              <br />
              {ar ? 'فريقنا.' : 'Our team.'}
              <br />
              <em>{ar ? 'التنفيذ.' : 'Delivered.'}</em>
            </h2>
            <p>{t.home.servicesText}</p>
            <div className="x-request-actions">
              <Link href={`/${locale}/request`} className="x-btn x-btn-accent">
                {t.home.extra.startRequest} <Arrow size={17} />
              </Link>
              <a href={telHref(settings.phone)} className="x-btn x-btn-ghost" dir="ltr">
                <Phone size={16} /> {settings.phone}
              </a>
            </div>
          </div>

          <ol className="x-steps reveal">
            {t.home.extra.steps.map((step, index) => (
              <li key={step.title}>
                <span className="x-step-n">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <b>{step.title}</b>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
