/**
 * Aligns sectors, services and companies with the new site structure.
 * Usage: node scripts/restructure-content.mjs [--remote]
 * --remote also upserts the result into Supabase using .env.local credentials.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const seedPath = path.join(root, 'lib', 'seed.json');
const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
const now = new Date().toISOString();

const sectorById = new Map(seed.sectors.map((row) => [row.id, row]));

function patchSector(id, patch) {
  const row = sectorById.get(id);
  if (!row) throw new Error(`Missing sector ${id}`);
  Object.assign(row, patch, { updated_at: now });
}

patchSector('sec-contracting', {
  slug: 'contracting',
  name_ar: 'المقاولات والبناء',
  name_en: 'Contracting & Construction',
  tagline_ar: 'أساس المجموعة منذ 1976',
  tagline_en: 'The group’s foundation since 1976',
  summary_ar:
    'نبني المباني الحكومية والمجمعات الصحية والمدارس والفلل، إلى جانب الطرق والجسور والخرسانة الجاهزة — بخبرة تمتد منذ 1976.',
  summary_en:
    'Government buildings, health complexes, schools and villas, alongside roads, bridges and ready-mix concrete — with experience dating to 1976.',
  sort_order: 1,
  is_published: true,
});

patchSector('sec-trade', {
  slug: 'trade-services',
  name_ar: 'التجارة والخدمات',
  name_en: 'Trade & Services',
  tagline_ar: 'تجارة وتوريد وخدمات',
  tagline_en: 'Trade, supply and services',
  summary_ar:
    'استيراد وتوريد مواد البناء والأدوات الصحية والكهربائية، ومعدات المشاريع، إلى جانب خدمات التجزئة والبيع المباشر.',
  summary_en:
    'Import and supply of building materials, sanitary and electrical products, project equipment, plus retail and direct sales.',
  body_ar:
    seed.sectors.find((row) => row.id === 'sec-trade').body_ar +
    ' <h3><strong>التجزئة والخدمات المباشرة</strong></h3> <p>إلى جانب نشاط الاستيراد والتوريد، تدير المجموعة منافذ تجزئة وخدمات مباشرة تخدم الأسر والمشاريع في شمال الباطنة، مع حرص على توفير المنتجات الأصلية وخدمة ما بعد البيع.</p>',
  body_en:
    seed.sectors.find((row) => row.id === 'sec-trade').body_en +
    ' <h3><strong>Retail and direct services</strong></h3> <p>Alongside import and supply, the group operates retail outlets and direct services for families and projects across North Al Batinah, with genuine products and reliable after-sales support.</p>',
  sort_order: 4,
  is_published: true,
});

patchSector('sec-hotel', {
  slug: 'hospitality-tourism',
  name_ar: 'الضيافة والسياحة',
  name_en: 'Hospitality & Tourism',
  tagline_ar: 'فندق الواحة الخضراء — ضيافة في صحار',
  tagline_en: 'Green Oasis Hotel — hospitality in Sohar',
  summary_ar:
    'فندق الواحة الخضراء في صحار: 48 غرفة، وقاعات مناسبات ومؤتمرات، ومطعم وحدائق — تجربة ضيافة متكاملة في شمال الباطنة.',
  summary_en:
    'Green Oasis Hotel in Sohar: 48 rooms, event and conference halls, a restaurant and gardens — complete hospitality in North Al Batinah.',
  sort_order: 5,
  is_published: true,
});

patchSector('sec-school', {
  slug: 'education',
  name_ar: 'التعليم',
  name_en: 'Education',
  tagline_ar: 'مدرسة صحم الخاصة',
  tagline_en: 'Saham Private School',
  summary_ar:
    'مدرسة صحم الخاصة للتعليم الأساسي، تجمع بين القيم العُمانية والمنهج التربوي الحديث وبيئة تعليمية محفزة.',
  summary_en:
    'Saham Private School for basic education, combining Omani values, a modern curriculum and an inspiring learning environment.',
  sort_order: 6,
  is_published: true,
});

patchSector('sec-mining', {
  slug: 'energy-mining',
  name_ar: 'الطاقة والتعدين',
  name_en: 'Energy & Mining',
  tagline_ar: 'ركام عالي الجودة وخدمات طاقة',
  tagline_en: 'High-grade aggregates and energy services',
  summary_ar:
    'استخراج الركام والرمل والحصباء من محاجر الأودية، وتوريد مواد البناء، إلى جانب خدمات وحلول الطاقة.',
  summary_en:
    'Extracting aggregate, sand and gravel from wadi quarries, supplying construction materials and supporting energy services.',
  sort_order: 7,
  is_published: true,
});

patchSector('sec-aluminium', {
  slug: 'industry',
  name_ar: 'الصناعة والتصنيع',
  name_en: 'Industry & Manufacturing',
  tagline_ar: 'ألمنيوم وأخشاب وحديد ومصاعد',
  tagline_en: 'Aluminium, wood, steel and elevators',
  summary_ar:
    'ورش ومصانع متكاملة للألمنيوم والأخشاب والحديد، وتركيب المصاعد والسلالم وأنظمة التكييف وفق أعلى المواصفات.',
  summary_en:
    'Integrated aluminium, wood and steel workshops, plus elevators, escalators and HVAC installation to the highest standards.',
  sort_order: 9,
  is_published: true,
});

patchSector('sec-roads', { is_published: false, sort_order: 10 });
patchSector('sec-concrete', { is_published: false, sort_order: 11 });
patchSector('sec-elevators', { is_published: false, sort_order: 12 });

const newSectors = [
  {
    id: 'sec-realestate',
    slug: 'real-estate-development',
    name_ar: 'التطوير العقاري',
    name_en: 'Real Estate Development',
    tagline_ar: 'مشاريع سكنية وتجارية متكاملة',
    tagline_en: 'Integrated residential and commercial projects',
    summary_ar:
      'تطوير مجمعات سكنية ومشاريع تجارية واستخدام مختلط، من دراسة الجدوى والتصميم حتى التسليم وإدارة الأملاك.',
    summary_en:
      'Residential communities, commercial and mixed-use developments — from feasibility and design to delivery and property management.',
    body_ar:
      '<p>يمثّل <strong>التطوير العقاري</strong> أحد أسرع قطاعات مجموعة البادي نمواً، حيث نطوّر مجمعات سكنية ومشاريع تجارية متكاملة تجمع بين جودة التصميم وكفاءة التنفيذ وقيمة الاستثمار على المدى الطويل.</p><p>نعمل على امتداد محافظات السلطنة، من اختيار الموقع ودراسة الجدوى إلى التصميم والتنفيذ والتسليم وإدارة الأملاك، وفق منهجية واضحة تضمن الالتزام بالمواعيد والمواصفات.</p><h3>لماذا البادي في التطوير العقاري؟</h3><ul><li>خبرة تنفيذية تمتد منذ 1976 في البناء والبنية الأساسية.</li><li>تكامل مع قطاعات المقاولات والصناعة والتجارة داخل المجموعة.</li><li>تصاميم عصرية تراعي الهوية العُمانية والاستدامة.</li><li>إدارة أملاك وخدمات ما بعد التسليم.</li></ul><p>نؤمن بأن المشروع الناجح لا يُقاس بعدد الوحدات فقط، بل بجودة الحياة التي يضيفها إلى المجتمع.</p>',
    body_en:
      '<p><strong>Real estate development</strong> is one of the group’s fastest-growing sectors. We develop integrated residential communities and commercial projects that combine design quality, delivery efficiency and long-term investment value.</p><p>We work across Oman, from site selection and feasibility through design, construction, handover and property management, with a clear methodology that protects timelines and specifications.</p><h3>Why Al-Badi in real estate?</h3><ul><li>Delivery experience dating back to 1976 in construction and infrastructure.</li><li>Integration with the group’s contracting, industry and trade sectors.</li><li>Contemporary design that respects Omani identity and sustainability.</li><li>Property management and after-handover services.</li></ul><p>A successful development is measured not only by units delivered, but by the quality of life it adds to the community.</p>',
    hero_url: '/media/hero/hero-2.webp',
    sort_order: 2,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'sec-logistics',
    slug: 'logistics',
    name_ar: 'الخدمات اللوجستية',
    name_en: 'Logistics Services',
    tagline_ar: 'نقل وشحن ومستودعات',
    tagline_en: 'Transport, freight and warehousing',
    summary_ar:
      'حلول نقل وشحن وتخزين وتوزيع متكاملة، بأسطول مركبات ومستودعات تخدم مشاريع المجموعة وعملاءها.',
    summary_en:
      'Integrated transport, freight, warehousing and distribution, backed by a vehicle fleet and warehouses serving the group and its clients.',
    body_ar:
      '<p>يقدّم قطاع <strong>الخدمات اللوجستية</strong> حلولاً متكاملة للنقل والشحن والتخزين والتوزيع، مستنداً إلى أسطول مركبات ومعدات وشبكة مستودعات تخدم مشاريع المجموعة وعملاءها في القطاعين العام والخاص.</p><p>ندير سلسلة الإمداد من نقطة التوريد حتى موقع التسليم، مع تتبع دقيق والتزام بمعايير السلامة والمواعيد.</p><h3>خدماتنا اللوجستية</h3><ul><li>نقل بري للمواد الثقيلة والمعدات.</li><li>شحن وتخليص جمركي.</li><li>مستودعات وتخزين آمن.</li><li>توزيع وخدمات الميل الأخير.</li><li>إدارة أسطول وصيانة دورية.</li></ul><p>نربط مواقع المشاريع والمصانع والمحاجر بشبكة نقل موثوقة تقلّل الوقت والتكلفة وتحمي البضائع.</p>',
    body_en:
      '<p>The <strong>logistics sector</strong> delivers integrated transport, freight, warehousing and distribution, supported by a fleet of vehicles and equipment and a warehouse network serving group projects and public and private clients.</p><p>We manage the supply chain from origin to delivery point, with accurate tracking and a firm commitment to safety and schedules.</p><h3>Our logistics services</h3><ul><li>Road transport for heavy materials and equipment.</li><li>Freight and customs clearance.</li><li>Secure warehousing and storage.</li><li>Distribution and last-mile services.</li><li>Fleet management and scheduled maintenance.</li></ul><p>We connect project sites, factories and quarries through a reliable transport network that cuts time and cost while protecting cargo.</p>',
    hero_url: '/media/hero/hero-3.webp',
    sort_order: 3,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'sec-investment',
    slug: 'investment',
    name_ar: 'الاستثمار',
    name_en: 'Investment',
    tagline_ar: 'محفظة وشراكات ورؤية طويلة الأمد',
    tagline_en: 'Portfolio, partnerships and long-term vision',
    summary_ar:
      'إدارة محفظة المجموعة وشراكاتها، ودراسة الفرص في القطاعات الواعدة، وبناء خطط نمو تحفظ رأس المال.',
    summary_en:
      'Managing the group’s portfolio and partnerships, assessing opportunities in promising sectors and building growth plans that preserve capital.',
    body_ar:
      '<p>يدير قطاع <strong>الاستثمار</strong> محفظة المجموعة وشراكاتها، ويقيّم الفرص في القطاعات الواعدة، ويضع دراسات الجدوى وخطط النمو بما يحفظ رأس المال ويحقّق عوائد مستدامة.</p><p>نستثمر حيث تلتقي خبرتنا التشغيلية مع حاجة السوق، وندعم الشركات التابعة بالحوكمة والتخطيط المالي وإدارة المخاطر.</p><h3>مجالات عملنا</h3><ul><li>إدارة الاستثمارات والمحافظ.</li><li>الشراكات الاستثمارية المشتركة.</li><li>دراسات الجدوى وتقييم الفرص.</li><li>حوكمة الشركات وإدارة المخاطر.</li></ul><p>ننظر إلى الاستثمار كمسؤولية طويلة الأمد تجاه الاقتصاد الوطني والأجيال القادمة.</p>',
    body_en:
      '<p>The <strong>investment sector</strong> manages the group’s portfolio and partnerships, assesses opportunities in promising sectors and builds feasibility studies and growth plans that preserve capital and deliver sustainable returns.</p><p>We invest where our operating experience meets market need, supporting subsidiaries with governance, financial planning and risk management.</p><h3>What we do</h3><ul><li>Investment and portfolio management.</li><li>Joint investment partnerships.</li><li>Feasibility studies and opportunity assessment.</li><li>Corporate governance and risk management.</li></ul><p>We see investment as a long-term responsibility towards the national economy and future generations.</p>',
    hero_url: '/media/projects/p3.webp',
    sort_order: 8,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
];

for (const sector of newSectors) {
  if (!sectorById.has(sector.id)) seed.sectors.push(sector);
  else Object.assign(sectorById.get(sector.id), sector);
}

seed.sectors.sort((a, b) => a.sort_order - b.sort_order);

// Fold legacy business lines into the new sector structure.
const serviceById = new Map(seed.services.map((row) => [row.id, row]));
function reassign(id, sectorId, sort) {
  const row = serviceById.get(id);
  if (!row) throw new Error(`Missing service ${id}`);
  row.sector_id = sectorId;
  row.sort_order = sort;
  row.updated_at = now;
}

['svc-roads-1', 'svc-roads-2', 'svc-roads-3'].forEach((id, i) => reassign(id, 'sec-contracting', 6 + i));
['svc-concrete-1', 'svc-concrete-2', 'svc-concrete-3', 'svc-concrete-4'].forEach((id, i) =>
  reassign(id, 'sec-contracting', 9 + i)
);
['svc-elevators-1', 'svc-elevators-2', 'svc-elevators-3', 'svc-elevators-4'].forEach((id, i) =>
  reassign(id, 'sec-aluminium', 5 + i)
);

const newServices = [
  ['svc-re-1', 'sec-realestate', 'تطوير المجمعات السكنية', 'Residential community development', 'تصميم وتنفيذ مجمعات سكنية متكاملة الخدمات.', 'Design and delivery of fully serviced residential communities.'],
  ['svc-re-2', 'sec-realestate', 'المشاريع التجارية', 'Commercial developments', 'مبانٍ مكتبية ومجمعات تجارية بمواقع استراتيجية.', 'Office buildings and retail complexes in strategic locations.'],
  ['svc-re-3', 'sec-realestate', 'الاستخدام المختلط', 'Mixed-use projects', 'مشاريع تجمع السكن والتجزئة والمكاتب في نسيج واحد.', 'Projects blending homes, retail and offices in one fabric.'],
  ['svc-re-4', 'sec-realestate', 'تطوير الأراضي', 'Land development', 'تخطيط الأراضي وتجهيزها بالبنية الأساسية والخدمات.', 'Land planning and preparation with infrastructure and utilities.'],
  ['svc-re-5', 'sec-realestate', 'إدارة الأملاك', 'Property management', 'تشغيل وصيانة العقارات وإدارة العلاقة مع السكان.', 'Property operations, maintenance and resident relations.'],
  ['svc-log-1', 'sec-logistics', 'النقل البري', 'Road transport', 'نقل المواد الثقيلة والمعدات بين المواقع والمحاجر.', 'Heavy material and equipment haulage between sites and quarries.'],
  ['svc-log-2', 'sec-logistics', 'الشحن والتخليص', 'Freight & clearance', 'شحن داخلي وخارجي وتخليص جمركي.', 'Domestic and international freight with customs clearance.'],
  ['svc-log-3', 'sec-logistics', 'المستودعات', 'Warehousing', 'تخزين آمن ومُدار للمواد والمعدات.', 'Secure, managed storage for materials and equipment.'],
  ['svc-log-4', 'sec-logistics', 'إدارة الأسطول', 'Fleet management', 'تشغيل وصيانة المركبات والمعدات.', 'Vehicle and equipment operations and maintenance.'],
  ['svc-log-5', 'sec-logistics', 'التوزيع', 'Distribution', 'توزيع المنتجات وخدمات الميل الأخير.', 'Product distribution and last-mile services.'],
  ['svc-inv-1', 'sec-investment', 'إدارة الاستثمارات', 'Investment management', 'إدارة محفظة المجموعة وشراكاتها.', 'Managing the group portfolio and its partnerships.'],
  ['svc-inv-2', 'sec-investment', 'الشراكات الاستثمارية', 'Investment partnerships', 'بناء شراكات مشتركة مع مستثمرين ومشغلين.', 'Building joint ventures with investors and operators.'],
  ['svc-inv-3', 'sec-investment', 'دراسات الجدوى', 'Feasibility studies', 'تقييم الفرص ودراسة العوائد والمخاطر.', 'Opportunity assessment, return and risk analysis.'],
  ['svc-inv-4', 'sec-investment', 'إدارة المحافظ', 'Portfolio management', 'متابعة الأداء وإعادة التوازن وفق الأهداف.', 'Performance tracking and rebalancing against objectives.'],
  ['svc-trade-4', 'sec-trade', 'البيع بالتجزئة', 'Retail', 'منافذ تجزئة تخدم الأسر والمشاريع.', 'Retail outlets serving families and projects.'],
  ['svc-trade-5', 'sec-trade', 'توريد المعدات', 'Equipment supply', 'معدات وآلات صناعية وإنشائية للمشاريع.', 'Industrial and construction equipment for projects.'],
  ['svc-hotel-4', 'sec-hotel', 'السياحة والرحلات', 'Tourism & trips', 'برامج إقامة ورحلات للزوار والمجموعات.', 'Stay packages and trips for visitors and groups.'],
  ['svc-hotel-5', 'sec-hotel', 'تنظيم الفعاليات', 'Event management', 'مؤتمرات وأعراس ومناسبات اجتماعية.', 'Conferences, weddings and social events.'],
  ['svc-mining-4', 'sec-mining', 'خدمات الطاقة', 'Energy services', 'دعم تشغيل وحلول طاقة للمشاريع والمرافق.', 'Operational support and energy solutions for projects and facilities.'],
];

let nextServiceId = 100;
for (const [id, sector_id, name_ar, name_en, summary_ar, summary_en] of newServices) {
  if (serviceById.has(id)) continue;
  const siblings = seed.services.filter((row) => row.sector_id === sector_id);
  const service = {
    id,
    sector_id,
    company_id: null,
    slug: id.replace(/^svc-/, ''),
    name_ar,
    name_en,
    summary_ar,
    summary_en,
    body_ar: null,
    body_en: null,
    image_url: null,
    sort_order: siblings.length + 1,
    is_published: true,
    is_requestable: true,
    created_at: now,
    updated_at: now,
  };
  seed.services.push(service);
  serviceById.set(id, service);
  nextServiceId += 1;
}

// Companies follow the new sector mapping.
const companyById = new Map(seed.companies.map((row) => [row.id, row]));
function patchCompany(id, patch) {
  const row = companyById.get(id);
  if (!row) throw new Error(`Missing company ${id}`);
  Object.assign(row, patch, { updated_at: now });
}
patchCompany('co-3', { sector_id: 'sec-aluminium' });
patchCompany('co-2', { sector_id: 'sec-aluminium' });
patchCompany('co-4', { sector_id: 'sec-hotel' });
patchCompany('co-5', { sector_id: 'sec-school' });

const newCompanies = [
  {
    id: 'co-6',
    sector_id: 'sec-realestate',
    slug: 'albadi-real-estate',
    name_ar: 'البادي للتطوير العقاري',
    name_en: 'Al-Badi Real Estate Development',
    description_ar: 'تطوير مجمعات سكنية ومشاريع تجارية متكاملة بمعايير عُمانية.',
    description_en: 'Residential communities and commercial developments to Omani standards.',
    logo_url: null,
    website: null,
    sort_order: 6,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'co-7',
    sector_id: 'sec-mining',
    slug: 'gulfa-crushers',
    name_ar: 'جلفا للتجارة والكسارات',
    name_en: 'Gulfa Trading & Crushers',
    description_ar: 'إنتاج وتوريد الركام والرمل والحصباء لمشاريع البناء والطرق.',
    description_en: 'Producing and supplying aggregate, sand and gravel for construction and roads.',
    logo_url: '/media/companies/co-mining.webp',
    website: null,
    sort_order: 7,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'co-8',
    sector_id: 'sec-trade',
    slug: 'albadi-mart',
    name_ar: 'البادي مارت',
    name_en: 'Al-Badi Mart',
    description_ar: 'منافذ تجزئة وخدمات توريد تلبي احتياجات الأسر والمشاريع.',
    description_en: 'Retail outlets and supply services for families and projects.',
    logo_url: null,
    website: null,
    sort_order: 8,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
];

for (const company of newCompanies) {
  if (!companyById.has(company.id)) seed.companies.push(company);
  else Object.assign(companyById.get(company.id), company);
}
seed.companies.sort((a, b) => a.sort_order - b.sort_order);

seed.settings.sort((a, b) => String(a.key).localeCompare(String(b.key)));
await fs.writeFile(seedPath, JSON.stringify(seed, null, 2) + '\n', 'utf8');
console.log(
  `seed updated: ${seed.sectors.length} sectors (${seed.sectors.filter((s) => s.is_published).length} published), ` +
    `${seed.services.length} services, ${seed.companies.length} companies`
);

if (!process.argv.includes('--remote')) process.exit(0);

const env = Object.fromEntries(
  (await fs.readFile(path.join(root, '.env.local'), 'utf8'))
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2].replace(/^["']|["']$/g, '')])
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase credentials missing from .env.local');

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function upsert(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);
}

await upsert('sectors', seed.sectors);
await upsert('services', seed.services);
await upsert('companies', seed.companies);

const defaults = {
  brand_name_ar: 'مجموعة البادي للاستثمار القابضة',
  brand_name_en: 'Al-Badi Investment Holding Group',
  brand_tagline_ar: 'نبني عُمان منذ 1976',
  brand_tagline_en: 'Building Oman since 1976',
  contact_phone: '+968 26 854 411',
  contact_fax: '+968 26 855 744',
  contact_email: 'albadi@albadigroup.com',
  contact_address_ar: 'ص.ب. 70، الرمز البريدي 319، ولاية صحم، سلطنة عُمان',
  contact_address_en: 'P.O. Box 70, Postal Code 319, Saham, Sultanate of Oman',
  contact_hours_ar: 'الأحد – الخميس، 8:00 صباحاً – 4:00 مساءً',
  contact_hours_en: 'Sun – Thu, 8:00 AM – 4:00 PM',
  social_instagram: 'https://www.instagram.com/albadigroup/',
  social_linkedin: 'https://www.linkedin.com/company/al-badi-group',
  social_x: '',
  social_facebook: '',
  social_youtube: '',
  social_whatsapp: '',
};

const { data: existingSettings, error: settingsError } = await supabase.from('settings').select('*');
if (settingsError) throw new Error(`settings: ${settingsError.message}`);
const byKey = new Map((existingSettings ?? []).map((row) => [row.key, row]));

for (const [settingKey, value] of Object.entries(defaults)) {
  const existing = byKey.get(settingKey);
  if (existing) {
    if (!existing.value) await supabase.from('settings').update({ value }).eq('id', existing.id);
    continue;
  }
  const { error } = await supabase
    .from('settings')
    .insert({ id: crypto.randomUUID(), key: settingKey, value, updated_at: now });
  if (error) throw new Error(`settings insert ${settingKey}: ${error.message}`);
}

console.log('remote sync complete');
