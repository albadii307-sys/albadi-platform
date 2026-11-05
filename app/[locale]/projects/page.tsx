import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { ProjectCard } from '@/components/cards';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { getProjects, getSectors } from '@/lib/queries';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sector?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.projects.title,
    description: t.projects.subtitle,
    alternates: { canonical: `/${l}/projects`, languages: { ar: '/ar/projects', en: '/en/projects' } },
  };
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const { sector } = await searchParams;
  const t = getDict(locale);

  const [projects, sectors] = await Promise.all([getProjects(), getSectors()]);
  const filtered = sector ? projects.filter((project) => project.sector_id === sectors.find((s) => s.slug === sector)?.id) : projects;

  return (
    <>
      <PageHero locale={locale} title={t.projects.title} subtitle={t.projects.subtitle} crumbs={[{ label: t.nav.projects }]} />
      <section className="section">
        <div className="container">
          <div className="filter-row">
            <Link href={`/${locale}/projects`} className={`chip ${!sector ? 'is-active' : ''}`}>
              {t.common.all}
            </Link>
            {sectors.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/projects?sector=${item.slug}`}
                className={`chip ${sector === item.slug ? 'is-active' : ''}`}
              >
                {pick(item, 'name', locale)}
              </Link>
            ))}
          </div>
          {filtered.length ? (
            <div className="project-grid">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} locale={locale} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>{t.common.empty}</p>
          )}
        </div>
      </section>
    </>
  );
}
