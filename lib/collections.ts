export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'select'
  | 'number'
  | 'boolean'
  | 'date'
  | 'relation'
  | 'icon';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  relation?: string;
  full?: boolean;
};

export type Collection = {
  key: string;
  table: string;
  label: string;
  singular: string;
  titleField: string;
  description?: string;
  fields: Field[];
  listFields: string[];
};

const publishField: Field = { name: 'is_published', label: 'منشور', type: 'boolean', help: 'إلغاء التحديد يخفي العنصر من الموقع' };
const orderField: Field = { name: 'sort_order', label: 'الترتيب', type: 'number' };

export const collections: Record<string, Collection> = {
  sectors: {
    key: 'sectors',
    table: 'sectors',
    label: 'القطاعات',
    singular: 'قطاع',
    titleField: 'name_ar',
    description: 'القطاعات التشغيلية للمجموعة وخدماتها.',
    listFields: ['name_ar', 'slug', 'sort_order', 'is_published'],
    fields: [
      { name: 'name_ar', label: 'الاسم (عربي)', type: 'text', required: true },
      { name: 'name_en', label: 'الاسم (إنجليزي)', type: 'text', required: true },
      { name: 'slug', label: 'الرابط (slug)', type: 'text', help: 'مثال: contracting — يستخدم في عنوان الصفحة' },
      { name: 'tagline_ar', label: 'العنوان الفرعي (عربي)', type: 'text' },
      { name: 'tagline_en', label: 'العنوان الفرعي (إنجليزي)', type: 'text' },
      { name: 'summary_ar', label: 'الوصف المختصر (عربي)', type: 'textarea', full: true },
      { name: 'summary_en', label: 'الوصف المختصر (إنجليزي)', type: 'textarea', full: true },
      { name: 'body_ar', label: 'المحتوى (عربي)', type: 'richtext', full: true },
      { name: 'body_en', label: 'المحتوى (إنجليزي)', type: 'richtext', full: true },
      { name: 'hero_url', label: 'صورة القطاع', type: 'image', full: true },
      orderField,
      publishField,
    ],
  },
  companies: {
    key: 'companies',
    table: 'companies',
    label: 'الشركات التابعة',
    singular: 'شركة',
    titleField: 'name_ar',
    listFields: ['name_ar', 'sector_id', 'sort_order', 'is_published'],
    fields: [
      { name: 'name_ar', label: 'الاسم (عربي)', type: 'text', required: true },
      { name: 'name_en', label: 'الاسم (إنجليزي)', type: 'text', required: true },
      { name: 'slug', label: 'الرابط (slug)', type: 'text' },
      { name: 'sector_id', label: 'القطاع', type: 'relation', relation: 'sectors' },
      { name: 'description_ar', label: 'الوصف (عربي)', type: 'textarea', full: true },
      { name: 'description_en', label: 'الوصف (إنجليزي)', type: 'textarea', full: true },
      { name: 'logo_url', label: 'الشعار', type: 'image' },
      { name: 'website', label: 'الموقع الإلكتروني', type: 'text' },
      orderField,
      publishField,
    ],
  },
  services: {
    key: 'services',
    table: 'services',
    label: 'الخدمات',
    singular: 'خدمة',
    titleField: 'name_ar',
    description: 'الخدمات المعروضة داخل كل قطاع والقابلة للطلب.',
    listFields: ['name_ar', 'sector_id', 'is_requestable', 'sort_order', 'is_published'],
    fields: [
      { name: 'name_ar', label: 'اسم الخدمة (عربي)', type: 'text', required: true },
      { name: 'name_en', label: 'اسم الخدمة (إنجليزي)', type: 'text', required: true },
      { name: 'slug', label: 'الرابط (slug)', type: 'text' },
      { name: 'sector_id', label: 'القطاع', type: 'relation', relation: 'sectors', required: true },
      { name: 'company_id', label: 'الشركة المنفذة', type: 'relation', relation: 'companies' },
      { name: 'summary_ar', label: 'الوصف (عربي)', type: 'textarea', full: true },
      { name: 'summary_en', label: 'الوصف (إنجليزي)', type: 'textarea', full: true },
      { name: 'body_ar', label: 'تفاصيل إضافية (عربي)', type: 'richtext', full: true },
      { name: 'body_en', label: 'تفاصيل إضافية (إنجليزي)', type: 'richtext', full: true },
      { name: 'image_url', label: 'صورة الخدمة', type: 'image', full: true },
      { name: 'icon', label: 'أيقونة الخدمة', type: 'icon', help: 'تظهر في بطاقات الخدمات والقوائم وصفحة الخدمة.' },
      { name: 'is_requestable', label: 'قابلة للطلب من الموقع', type: 'boolean' },
      orderField,
      publishField,
    ],
  },
  projects: {
    key: 'projects',
    table: 'projects',
    label: 'المشاريع',
    singular: 'مشروع',
    titleField: 'title_ar',
    listFields: ['title_ar', 'sector_id', 'year', 'is_featured', 'is_published'],
    fields: [
      { name: 'title_ar', label: 'العنوان (عربي)', type: 'text', required: true },
      { name: 'title_en', label: 'العنوان (إنجليزي)', type: 'text', required: true },
      { name: 'slug', label: 'الرابط (slug)', type: 'text' },
      { name: 'sector_id', label: 'القطاع', type: 'relation', relation: 'sectors' },
      { name: 'client_ar', label: 'العميل (عربي)', type: 'text' },
      { name: 'client_en', label: 'العميل (إنجليزي)', type: 'text' },
      { name: 'location_ar', label: 'الموقع (عربي)', type: 'text' },
      { name: 'location_en', label: 'الموقع (إنجليزي)', type: 'text' },
      { name: 'year', label: 'سنة التنفيذ', type: 'number' },
      { name: 'cover_url', label: 'صورة المشروع', type: 'image', full: true },
      { name: 'body_ar', label: 'التفاصيل (عربي)', type: 'richtext', full: true },
      { name: 'body_en', label: 'التفاصيل (إنجليزي)', type: 'richtext', full: true },
      { name: 'is_featured', label: 'إبراز في الصفحة الرئيسية', type: 'boolean' },
      orderField,
      publishField,
    ],
  },
  news: {
    key: 'news',
    table: 'news',
    label: 'الأخبار',
    singular: 'خبر',
    titleField: 'title_ar',
    listFields: ['title_ar', 'category', 'published_at', 'is_published'],
    fields: [
      { name: 'title_ar', label: 'العنوان (عربي)', type: 'text', required: true },
      { name: 'title_en', label: 'العنوان (إنجليزي)', type: 'text', required: true },
      { name: 'slug', label: 'الرابط (slug)', type: 'text' },
      {
        name: 'category',
        label: 'التصنيف',
        type: 'select',
        options: [
          { value: 'group', label: 'أخبار المجموعة' },
          { value: 'csr', label: 'الأعمال الاجتماعية' },
          { value: 'media', label: 'التغطيات الإعلامية' },
        ],
      },
      { name: 'published_at', label: 'تاريخ النشر', type: 'date', required: true },
      { name: 'excerpt_ar', label: 'الملخص (عربي)', type: 'textarea', full: true },
      { name: 'excerpt_en', label: 'الملخص (إنجليزي)', type: 'textarea', full: true },
      { name: 'body_ar', label: 'الخبر (عربي)', type: 'richtext', full: true },
      { name: 'body_en', label: 'الخبر (إنجليزي)', type: 'richtext', full: true },
      { name: 'cover_url', label: 'صورة الخبر', type: 'image', full: true },
      { name: 'external_url', label: 'رابط خارجي (اختياري)', type: 'text' },
      publishField,
    ],
  },
  team: {
    key: 'team',
    table: 'team',
    label: 'فريق العمل',
    singular: 'عضو',
    titleField: 'name_ar',
    description: 'أعضاء القيادة والفريق الذين يظهرون في الصفحة الرئيسية.',
    listFields: ['name_ar', 'role_ar', 'sort_order', 'is_published'],
    fields: [
      { name: 'name_ar', label: 'الاسم (عربي)', type: 'text', required: true },
      { name: 'name_en', label: 'الاسم (إنجليزي)', type: 'text', required: true },
      { name: 'role_ar', label: 'المسمى الوظيفي (عربي)', type: 'text', required: true },
      { name: 'role_en', label: 'المسمى الوظيفي (إنجليزي)', type: 'text', required: true },
      { name: 'bio_ar', label: 'نبذة (عربي)', type: 'textarea', full: true },
      { name: 'bio_en', label: 'نبذة (إنجليزي)', type: 'textarea', full: true },
      { name: 'photo_url', label: 'الصورة الشخصية', type: 'image', full: true, help: 'اتركها فارغة لعرض الأحرف الأولى بتصميم أنيق' },
      orderField,
      publishField,
    ],
  },
  pages: {
    key: 'pages',
    table: 'pages',
    label: 'الصفحات',
    singular: 'صفحة',
    titleField: 'title_ar',
    description: 'محتوى صفحات «عن المجموعة» و«الرؤية والرسالة».',
    listFields: ['key', 'title_ar'],
    fields: [
      {
        name: 'key',
        label: 'المعرّف',
        type: 'select',
        options: [
          { value: 'about', label: 'عن المجموعة' },
          { value: 'vision', label: 'الرؤية والرسالة' },
        ],
      },
      { name: 'title_ar', label: 'العنوان (عربي)', type: 'text', required: true },
      { name: 'title_en', label: 'العنوان (إنجليزي)', type: 'text', required: true },
      { name: 'body_ar', label: 'المحتوى (عربي)', type: 'richtext', full: true },
      { name: 'body_en', label: 'المحتوى (إنجليزي)', type: 'richtext', full: true },
    ],
  },
  media: {
    key: 'media',
    table: 'media',
    label: 'الوسائط',
    singular: 'ملف',
    titleField: 'title',
    listFields: ['title', 'kind'],
    fields: [
      { name: 'title', label: 'العنوان', type: 'text', required: true, full: true },
      { name: 'url', label: 'الملف', type: 'image', full: true },
      {
        name: 'kind',
        label: 'النوع',
        type: 'select',
        options: [
          { value: 'image', label: 'صورة' },
          { value: 'pdf', label: 'PDF' },
        ],
      },
    ],
  },
};

export const requestStatuses = [
  { value: 'new', label: 'جديد', tone: 'new' },
  { value: 'review', label: 'قيد المراجعة', tone: 'review' },
  { value: 'quoted', label: 'تم التسعير', tone: 'quoted' },
  { value: 'won', label: 'تم التعاقد', tone: 'won' },
  { value: 'closed', label: 'مغلق', tone: 'closed' },
] as const;
