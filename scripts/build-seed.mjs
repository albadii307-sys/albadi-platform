import fs from 'node:fs';

const IN = '../.tmp/intake';
const read = (f) => JSON.parse(fs.readFileSync(`${IN}/${f}`, 'utf8'));
const content = read('content.json');
const projectsRaw = read('project-details.json');
const newsRaw = read('news-details.json');
const newsList = read('news-list.json');
const csrRaw = read('csr.json');
const mediaRaw = read('media.json');

const now = '2026-11-05T09:00:00.000Z';

function cleanHtml(html) {
  if (!html) return null;
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\sstyle="[^"]*"/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<p>\s*<p>/gi, '<p>')
    .replace(/<\/p>\s*<\/p>/gi, '</p>')
    .replace(/<div[^>]*>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<font[^>]*>|<\/font>/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function stripTags(html) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const sectorMeta = {
  contracting: {
    slug: 'contracting',
    order: 1,
    tagline_ar: 'منذ 1976 — أساس المجموعة',
    tagline_en: 'Since 1976 — the group’s foundation',
    summary_ar:
      'مبانٍ حكومية ومجمعات صحية ومدارس وفلل سكنية، بخبرة تجاوزت أربعة عقود في القطاعين العام والخاص.',
    summary_en:
      'Government buildings, health centres, schools and residences, backed by four decades of public and private delivery.',
  },
  aluminium: {
    slug: 'aluminium-wood-steel',
    order: 2,
    tagline_ar: 'تصنيع وتشكيل المعادن والأخشاب',
    tagline_en: 'Metal, wood and aluminium fabrication',
    summary_ar:
      'ورش متكاملة للحديد والأخشاب والألمنيوم تنتج وفق المواصفات وتخدم مشاريع المجموعة والسوق المحلي.',
    summary_en:
      'Integrated steel, wood and aluminium workshops serving group projects and the local market to specification.',
  },
  trade: {
    slug: 'trade-import',
    order: 3,
    tagline_ar: 'توريد واستيراد',
    tagline_en: 'Import and supply',
    summary_ar:
      'استيراد مواد البناء والأدوات الصحية والكهربائية وتوريدها للمشاريع الحكومية والخاصة.',
    summary_en:
      'Importing building materials, sanitary and electrical supplies for public and private projects.',
  },
  roads: {
    slug: 'roads-bridges',
    order: 4,
    tagline_ar: 'منذ 2006 — طرق وجسور',
    tagline_en: 'Since 2006 — roads and bridges',
    summary_ar:
      'أسطول معدات ثقيلة ووحدة هندسية متخصصة لتنفيذ الطرق والجسور وأعمال السفلتة.',
    summary_en:
      'A heavy-equipment fleet and a dedicated engineering unit for roads, bridges and asphalt works.',
  },
  mining: {
    slug: 'sand-gravel',
    order: 5,
    tagline_ar: 'ركام عالي الجودة',
    tagline_en: 'High-grade aggregates',
    summary_ar:
      'استخراج الركام والرمل والحصباء من محاجر الأودية لتغذية قطاعي الخرسانة والطرق.',
    summary_en:
      'Extracting aggregate, sand and gravel from wadi quarries to feed concrete and road operations.',
  },
  elevators: {
    slug: 'elevators-hvac',
    order: 6,
    tagline_ar: 'مصاعد وسلالم وتكييف',
    tagline_en: 'Elevators, escalators and HVAC',
    summary_ar:
      'تركيب وصيانة المصاعد والسلالم الكهربائية وأنظمة التكييف، بتراخيص معتمدة منذ 2009.',
    summary_en:
      'Installation and maintenance of elevators, escalators and HVAC systems, licensed since 2009.',
  },
  hotel: {
    slug: 'green-oasis-hotel',
    order: 7,
    tagline_ar: 'ضيافة في صحار',
    tagline_en: 'Hospitality in Sohar',
    summary_ar:
      'فندق الواحة الخضراء في صحار: 48 غرفة ومجموعة قاعات مناسبات وخدمات ضيافة متكاملة.',
    summary_en:
      'Green Oasis Hotel in Sohar: 48 rooms, event halls and full hospitality services.',
  },
  concrete: {
    slug: 'concrete-interlock',
    order: 8,
    tagline_ar: 'خرسانة وإنترلوك وطابوق',
    tagline_en: 'Concrete, interlock and blocks',
    summary_ar:
      'منتجات خرسانية معتمدة من الجهات الحكومية لمشاريع البناء والبنية التحتية.',
    summary_en:
      'Government-approved concrete products for construction and infrastructure projects.',
  },
  school: {
    slug: 'saham-private-school',
    order: 9,
    tagline_ar: 'تعليم أساسي خاص',
    tagline_en: 'Private basic education',
    summary_ar:
      'مدرسة صحم الخاصة للتعليم الأساسي، تجمع بين القيم العُمانية والمنهج التربوي الحديث.',
    summary_en:
      'Saham Private School for basic education, combining Omani values with modern teaching.',
  },
};

const sectors = Object.entries(content.sectors).map(([key, value]) => {
  const meta = sectorMeta[key];
  return {
    id: `sec-${key}`,
    slug: meta.slug,
    name_ar: stripTags(value.ar.title),
    name_en: stripTags(value.en.title),
    tagline_ar: meta.tagline_ar,
    tagline_en: meta.tagline_en,
    summary_ar: meta.summary_ar,
    summary_en: meta.summary_en,
    body_ar: cleanHtml(value.ar.html),
    body_en: cleanHtml(value.en.html),
    hero_url: `/media/sectors/${key}.webp`,
    sort_order: meta.order,
    is_published: true,
    created_at: now,
    updated_at: now,
  };
});

const sectorId = (key) => `sec-${key}`;

const servicesSeed = {
  contracting: [
    ['government-buildings', 'إنشاء المباني الحكومية', 'Government building construction', 'تنفيذ المباني والمرافق الحكومية وفق مواصفات وزارة المالية ومجلس المناقصات.', 'Construction of government buildings and facilities to Ministry of Finance and Tender Board specifications.'],
    ['residential-buildings', 'الفلل والمباني السكنية', 'Villas and residential buildings', 'بناء الفلل السكنية والمباني غير السكنية من الأساس حتى التسليم.', 'Building villas and non-residential buildings from foundation to handover.'],
    ['health-education', 'المجمعات الصحية والمدارس', 'Health centres and schools', 'تنفيذ مجمعات صحية ومدارس تابعة لوزارة الصحة ووزارة التربية والتعليم.', 'Delivery of health centres and schools for the Ministry of Health and Ministry of Education.'],
    ['defence-facilities', 'مرافق وزارة الدفاع', 'Defence facilities', 'بناء مواقع عمل ومرافق لوجستية لصالح وزارة الدفاع.', 'Construction of worksites and logistics facilities for the Ministry of Defence.'],
    ['building-materials', 'مواد البناء والمواد الصحية', 'Building and sanitary materials', 'بيع وتوريد مواد البناء والمواد الصحية للمشاريع.', 'Sale and supply of building and sanitary materials for projects.'],
  ],
  aluminium: [
    ['steel-works', 'أعمال الحديد', 'Steel fabrication', 'ورش تصنيع الحديد والمنتجات المعدنية للمشاريع.', 'Steel and metal fabrication workshops for projects.'],
    ['wood-works', 'أعمال الأخشاب', 'Woodwork and joinery', 'تصنيع الأبواب والأثاث والأعمال الخشبية حسب الطلب.', 'Doors, furniture and custom joinery.'],
    ['aluminium-works', 'أعمال الألمنيوم', 'Aluminium fabrication', 'نوافذ وأبواب وواجهات ألمنيوم بمواصفات عالية.', 'Aluminium windows, doors and facades to high specifications.'],
    ['custom-fabrication', 'تصنيع حسب الطلب', 'Custom fabrication', 'تنفيذ قطع ومكونات معدنية و خشبية حسب المخططات.', 'Fabrication of metal and wood components to drawings.'],
  ],
  trade: [
    ['materials-import', 'استيراد مواد البناء', 'Building materials import', 'استيراد وتوريد مواد البناء من موردين معتمدين.', 'Import and supply of building materials from approved suppliers.'],
    ['sanitary-electrical', 'الأدوات الصحية والكهربائية', 'Sanitary and electrical supplies', 'توريد الأدوات الصحية والكهربائية وملحقاتها.', 'Supply of sanitary ware, electrical materials and accessories.'],
    ['project-supply', 'توريد المشاريع', 'Project supply', 'توريد متكامل للمشاريع الحكومية والخاصة بجداول زمنية محددة.', 'Integrated supply for public and private projects on agreed schedules.'],
  ],
  roads: [
    ['asphalt', 'أعمال السفلتة', 'Asphalt paving', 'سفلتة الطرق الداخلية والرئيسية باستخدام معدات متخصصة.', 'Paving internal and main roads with specialised equipment.'],
    ['internal-roads', 'الطرق الداخلية', 'Internal roads', 'تنفيذ شبكات الطرق الداخلية في الولايات والمشاريع السكنية.', 'Delivery of internal road networks in wilayats and residential projects.'],
    ['bridges', 'الجسور والأعمال الهندسية', 'Bridges and engineering works', 'أعمال الجسور والتخطيط الهندسي للطرق.', 'Bridge works and road engineering planning.'],
  ],
  mining: [
    ['aggregate', 'استخراج الركام', 'Aggregate extraction', 'استخراج الركام من محاجر الأودية عالية الجودة.', 'Extraction of aggregate from high-quality wadi quarries.'],
    ['sand-gravel', 'توريد الرمل والحصباء', 'Sand and gravel supply', 'توريد الرمل والحصباء لمصانع الخرسانة ومشاريع الطرق.', 'Supply of sand and gravel to concrete plants and road projects.'],
    ['quarry-management', 'تشغيل المحاجر', 'Quarry operations', 'تشغيل وإدارة المقالع وفق اشتراطات السلامة والبيئة.', 'Operation and management of quarries to safety and environmental requirements.'],
  ],
  elevators: [
    ['elevators', 'تركيب المصاعد', 'Elevator installation', 'توريد وتركيب المصاعد للمباني السكنية والتجارية والحكومية.', 'Supply and installation of elevators for residential, commercial and government buildings.'],
    ['escalators', 'السلالم الكهربائية', 'Escalators', 'توريد وتركيب السلالم الكهربائية للمراكز التجارية والمنشآت العامة.', 'Supply and installation of escalators for malls and public facilities.'],
    ['hvac', 'أنظمة التكييف', 'HVAC systems', 'تصميم وتركيب وصيانة أنظمة التكييف المركزي.', 'Design, installation and maintenance of central HVAC systems.'],
    ['maintenance', 'الصيانة وقطع الغيار', 'Maintenance and spare parts', 'عقود صيانة دورية وتوريد قطع الغيار الأصلية.', 'Scheduled maintenance contracts and genuine spare parts.'],
  ],
  hotel: [
    ['rooms', 'حجز الغرف', 'Room booking', '48 غرفة مجهزة بموقع استراتيجي في صحار قرب الطريق الرئيسي.', '48 equipped rooms in a strategic Sohar location on the main highway.'],
    ['events', 'قاعات المناسبات', 'Event halls', 'قاعات للأعراس والاجتماعات والمناسبات الاجتماعية.', 'Halls for weddings, meetings and social occasions.'],
    ['dining', 'المطعم', 'Restaurant', 'خدمات مطعم وضيافة للأفراد والمجموعات.', 'Restaurant and catering services for individuals and groups.'],
  ],
  concrete: [
    ['ready-mix', 'الخرسانة الجاهزة', 'Ready-mix concrete', 'خرسانة جاهزة بمواصفات معتمدة ومحطات خلط مجهزة.', 'Ready-mix concrete to approved specifications from equipped batching plants.'],
    ['interlock', 'الإنترلوك', 'Interlock paving', 'بلاط إنترلوك بأشكال وألوان متعددة للأرصفة والساحات.', 'Interlock paving in a range of shapes and colours for sidewalks and yards.'],
    ['blocks', 'الطابوق', 'Concrete blocks', 'طابوق خرساني بمقاسات قياسية معتمد للمشاريع.', 'Standard-size concrete blocks approved for projects.'],
    ['curbstones', 'الأرصفة', 'Curbstones', 'أرصفة خرسانية للمدن والمشاريع السكنية.', 'Concrete curbstones for towns and residential projects.'],
  ],
  school: [
    ['admissions', 'التسجيل والقبول', 'Admissions', 'استقبال طلبات التسجيل للصفوف الأساسية وفق الطاقة الاستيعابية.', 'Admission applications for basic education grades subject to capacity.'],
    ['basic-education', 'التعليم الأساسي', 'Basic education', 'برنامج تعليمي متكامل يجمع المنهج الوطني والأنشطة التربوية.', 'An integrated programme combining the national curriculum and enrichment activities.'],
    ['activities', 'الأنشطة والبرامج', 'Activities and programmes', 'أنشطة ثقافية ورياضية وبرامج تطويرية للطلبة.', 'Cultural, sporting and development programmes for students.'],
    ['facilities', 'مرافق المدرسة', 'School facilities', 'قاعات دراسية ومختبرات ومرافق رياضية.', 'Classrooms, laboratories and sports facilities.'],
  ],
};

const services = [];
for (const [key, items] of Object.entries(servicesSeed)) {
  items.forEach(([slug, ar, en, sar, sen], index) => {
    services.push({
      id: `svc-${key}-${index + 1}`,
      sector_id: sectorId(key),
      company_id: null,
      slug: `${key}-${slug}`,
      name_ar: ar,
      name_en: en,
      summary_ar: sar,
      summary_en: sen,
      body_ar: null,
      body_en: null,
      image_url: null,
      sort_order: index + 1,
      is_published: true,
      is_requestable: true,
      created_at: now,
      updated_at: now,
    });
  });
}

const companies = [
  {
    id: 'co-1',
    sector_id: sectorId('contracting'),
    slug: 'albadi-trading-contracting',
    name_ar: 'مؤسسة البادي للتجارة والمقاولات',
    name_en: 'Al-Badi Trading & Contracting',
    description_ar: 'الذراع التنفيذي للمجموعة في المقاولات والبناء، ومن أبرز منفذي المشاريع الحكومية في سلطنة عُمان.',
    description_en: 'The group’s contracting arm and one of Oman’s established delivers of government projects.',
    logo_url: null,
    website: null,
  },
  {
    id: 'co-2',
    sector_id: sectorId('aluminium'),
    slug: 'albadi-technical-industries',
    name_ar: 'شركة البادي للصناعات الفنية',
    name_en: 'Al-Badi Technical Industries',
    description_ar: 'ورش الحديد والأخشاب والألمنيوم التي تخدم مشاريع المجموعة والسوق المحلي.',
    description_en: 'Steel, wood and aluminium workshops serving group projects and the local market.',
    logo_url: null,
    website: null,
  },
  {
    id: 'co-3',
    sector_id: sectorId('elevators'),
    slug: 'kawas-engineering',
    name_ar: 'شركة كاواس الهندسية',
    name_en: 'Kawas Engineering',
    description_ar: 'متخصصة في تقنيات الآلات والمعدات والمصاعد والسلالم الكهربائية وأعمال التكييف.',
    description_en: 'Specialists in machinery, equipment, elevators, escalators and HVAC works.',
    logo_url: null,
    website: null,
  },
  {
    id: 'co-4',
    sector_id: sectorId('hotel'),
    slug: 'green-oasis-hotel-company',
    name_ar: 'فندق الواحة الخضراء',
    name_en: 'Green Oasis Hotel',
    description_ar: 'فندق في صحار يضم 48 غرفة وقاعات مناسبات وخدمات ضيافة.',
    description_en: 'A Sohar hotel with 48 rooms, event halls and hospitality services.',
    logo_url: null,
    website: null,
  },
  {
    id: 'co-5',
    sector_id: sectorId('school'),
    slug: 'saham-private-school-company',
    name_ar: 'مدرسة صحم الخاصة',
    name_en: 'Saham Private School',
    description_ar: 'مؤسسة تعليمية للتعليم الأساسي تحت مظلة المجموعة.',
    description_en: 'A basic-education institution under the group.',
    logo_url: null,
    website: null,
  },
].map((c, i) => ({ ...c, sort_order: i + 1, is_published: true, created_at: now, updated_at: now }));

const projectMeta = [
  ['musanah-airbase', 'Al-Musanah Air Base (Samad & Jibreen)', 'وزارة الدفاع', 'Ministry of Defence', 'المصنعة', 'Al-Musanah', 2017, true],
  ['rustaq-health-centre', 'Rustaq Health Centre', 'وزارة الصحة', 'Ministry of Health', 'الرستاق', 'Rustaq', 2015, true],
  ['saham-police-station', 'Saham Police Station', 'شرطة عُمان السلطانية', 'Royal Oman Police', 'صحم', 'Saham', 2016, true],
  ['haima-army-camp', 'Royal Army of Oman Camp — Haima', 'وزارة الدفاع', 'Ministry of Defence', 'هيما', 'Haima', 2007, false],
  ['muadha-school', 'Muadha Al-Adawiya School', 'وزارة التربية والتعليم', 'Ministry of Education', 'صحم', 'Saham', 2007, true],
  ['jibreen-airbase', 'Jibreen Project — Al-Musanah Air Base', 'وزارة الدفاع', 'Ministry of Defence', 'المصنعة', 'Al-Musanah', 2015, false],
  ['suwaiq-roads', 'Internal Roads — Al-Suwaiq', 'بلدية السويق', 'Al-Suwaiq Municipality', 'السويق', 'Al-Suwaiq', 2017, false],
  ['mansour-mosque', 'Al-Mansour Mosque', 'شؤون البلاط السلطاني', 'Royal Court Affairs', 'الرستاق', 'Rustaq', 2017, false],
  ['mudhaibi-roads', 'Roads Project — Al-Mudhaibi', 'بلدية المضيبي', 'Al-Mudhaibi Municipality', 'المضيبي', 'Al-Mudhaibi', 2017, false],
  ['military-hospital', 'Military Hospital', 'وزارة الدفاع', 'Ministry of Defence', 'مسقط', 'Muscat', 2015, false],
  ['sohar-camp', 'Sohar Camp (Ahmed bin Majid)', 'وزارة الدفاع', 'Ministry of Defence', 'صحار', 'Sohar', 2018, false],
  ['saham-health-complex', 'Saham Health Complex', 'وزارة الصحة', 'Ministry of Health', 'صحم', 'Saham', null, false],
];

const projects = projectsRaw.map((p, i) => {
  const meta = projectMeta[i];
  return {
    id: `prj-${i + 1}`,
    slug: meta[0],
    title_ar: i === 11 ? 'مجمع صحم الصحي' : p.title.trim(),
    title_en: meta[1],
    client_ar: meta[2],
    client_en: meta[3],
    sector_id: sectorId(meta[0].includes('roads') ? 'roads' : 'contracting'),
    location_ar: meta[4],
    location_en: meta[5],
    year: meta[6],
    cover_url: p.local.replace(/\.jpg$/i, '.webp'),
    body_ar: cleanHtml(p.body_ar),
    body_en: cleanHtml(p.body_en) ?? stripTags(p.body_ar),
    is_featured: meta[7],
    is_published: true,
    sort_order: i + 1,
    created_at: now,
    updated_at: now,
  };
});

const enTitleById = new Map(
  newsList.en.map((x) => [(x.href.match(/news\/(\d+)/) || [])[1], x.title.replace(/\s+/g, ' ').trim()])
);

const months = {
  يناير: '01', فبراير: '02', مارس: '03', ابريل: '04', أبريل: '04', مايو: '05', يونيو: '06',
  يوليو: '07', اغسطس: '08', أغسطس: '08', سبتمبر: '09', اكتوبر: '10', أكتوبر: '10', نوفمبر: '11', ديسمبر: '12',
};

function parseArabicDate(value) {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 2) {
    const month = months[parts[0]] ?? '01';
    return `${parts[1]}-${month}-01T08:00:00.000Z`;
  }
  return '2025-01-01T08:00:00.000Z';
}

const news = newsRaw.map((item, i) => {
  const titleEn = (item.en_title || '').trim() || enTitleById.get(item.id) || '';
  const date = parseArabicDate(item.date);
  return {
    id: `news-${item.id}`,
    slug: `${item.id}-${(item.en_href || '').split('/').filter(Boolean).pop() || 'news'}-${item.id}`.slice(0, 90),
    title_ar: item.title.replace(/\s+/g, ' ').trim(),
    title_en: titleEn || item.title,
    excerpt_ar: (item.desc || stripTags(item.body_ar)).slice(0, 220),
    excerpt_en: stripTags(item.body_en).slice(0, 220) || null,
    body_ar: cleanHtml(item.body_ar),
    body_en: cleanHtml(item.body_en),
    cover_url: item.local.replace(/\.jpg$/i, '.webp'),
    category: 'group',
    published_at: date,
    external_url: null,
    is_published: true,
    created_at: now,
    updated_at: now,
  };
});

const csr = csrRaw
  .filter((x) => x.title.length < 300)
  .slice(0, 8)
  .map((item, i) => {
    const [d, m, y] = item.date.split('-');
    return {
      id: `csr-${i + 1}`,
      slug: `csr-${i + 1}`,
      title_ar: item.title,
      title_en: `Community initiative ${i + 1}`,
      excerpt_ar: null,
      excerpt_en: null,
      body_ar: null,
      body_en: null,
      cover_url: `/media/csr/c${i + 1}.webp`,
      category: 'csr',
      published_at: `${y}-${m}-${d}T08:00:00.000Z`,
      external_url: null,
      is_published: true,
      created_at: now,
      updated_at: now,
    };
  });

const media = mediaRaw.map((m, i) => ({
  id: `media-${i + 1}`,
  title: m.title.trim(),
  url: m.url,
  kind: /\.pdf$/i.test(m.url) ? 'pdf' : 'image',
  created_at: now,
}));

const pages = [
  {
    id: 'page-about',
    key: 'about',
    title_ar: 'عن المجموعة',
    title_en: 'About the group',
    body_ar: cleanHtml(content.pages.about.ar.html),
    body_en: cleanHtml(content.pages.about.en.html),
    updated_at: now,
  },
  {
    id: 'page-vision',
    key: 'vision',
    title_ar: 'رؤيتنا ورسالتنا',
    title_en: 'Vision and mission',
    body_ar: cleanHtml(content.pages.vision.ar.html),
    body_en: cleanHtml(content.pages.vision.en.html),
    updated_at: now,
  },
];

const seed = {
  sectors,
  companies,
  services,
  projects,
  news: [...news, ...csr],
  pages,
  media,
  requests: [],
};

fs.writeFileSync('lib/seed.json', JSON.stringify(seed, null, 2), 'utf8');
console.log(
  `seed written: ${sectors.length} sectors, ${services.length} services, ${companies.length} companies, ${projects.length} projects, ${seed.news.length} news, ${media.length} media`
);
