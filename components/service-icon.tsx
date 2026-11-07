import type { SVGProps } from 'react';
import {
  Award,
  Bed,
  Briefcase,
  Building,
  Compass,
  Droplet,
  Factory,
  Globe,
  GraduationCap,
  Home,
  Key,
  Layers,
  Leaf,
  Mountain,
  Road,
  Ruler,
  Shield,
  Ship,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  Zap,
} from './icons';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export const SERVICE_ICONS: { key: string; label: string; Icon: (props: IconProps) => React.ReactElement }[] = [
  { key: 'building', label: 'مبانٍ وإنشاءات', Icon: Building },
  { key: 'factory', label: 'صناعة ومصانع', Icon: Factory },
  { key: 'road', label: 'طرق وجسور', Icon: Road },
  { key: 'mountain', label: 'تعدين ومحاجر', Icon: Mountain },
  { key: 'layers', label: 'خرسانة ومواد بناء', Icon: Layers },
  { key: 'home', label: 'سكن وعقار', Icon: Home },
  { key: 'key', label: 'تطوير عقاري', Icon: Key },
  { key: 'truck', label: 'نقل ولوجستيات', Icon: Truck },
  { key: 'ship', label: 'استيراد وتصدير', Icon: Ship },
  { key: 'store', label: 'تجارة وتجزئة', Icon: Store },
  { key: 'bed', label: 'ضيافة وفنادق', Icon: Bed },
  { key: 'graduation', label: 'تعليم وتدريب', Icon: GraduationCap },
  { key: 'wrench', label: 'صيانة وتركيب', Icon: Wrench },
  { key: 'zap', label: 'طاقة وكهرباء', Icon: Zap },
  { key: 'droplet', label: 'مياه وسباكة', Icon: Droplet },
  { key: 'ruler', label: 'تصميم وهندسة', Icon: Ruler },
  { key: 'briefcase', label: 'خدمات أعمال', Icon: Briefcase },
  { key: 'trending', label: 'استثمار ونمو', Icon: TrendingUp },
  { key: 'globe', label: 'خدمات عامة', Icon: Globe },
  { key: 'users', label: 'كوادر وموارد بشرية', Icon: Users },
  { key: 'shield', label: 'جودة وسلامة', Icon: Shield },
  { key: 'leaf', label: 'استدامة وبيئة', Icon: Leaf },
  { key: 'compass', label: 'استشارات', Icon: Compass },
  { key: 'award', label: 'خبرة واعتماد', Icon: Award },
];

const DEFAULT_SECTOR_ICON: Record<string, string> = {
  contracting: 'building',
  'real-estate-development': 'key',
  logistics: 'ship',
  'trade-services': 'store',
  'hospitality-tourism': 'bed',
  education: 'graduation',
  'energy-mining': 'mountain',
  investment: 'trending',
  industry: 'factory',
  'roads-bridges': 'road',
  'concrete-interlock': 'layers',
  'sand-gravel': 'mountain',
  'elevators-hvac': 'wrench',
  'aluminium-wood-steel': 'factory',
  'trade-import': 'store',
  'green-oasis-hotel': 'bed',
  'saham-private-school': 'graduation',
};

const KEYWORD_ICON: [RegExp, string][] = [
  [/curb|interlock|block|concrete|paving/, 'layers'],
  [/aluminium|iron|steel|wood|facade|manufactur/, 'factory'],
  [/elevator|escalator|hvac|air-conditioning|maintenance|spare|install/, 'wrench'],
  [/asphalt|road|bridge|street/, 'road'],
  [/mining|aggregate|sand|gravel|quarry|quarries/, 'mountain'],
  [/room|restaurant|event|suite/, 'bed'],
  [/admission|curriculum|activit|facilit|school/, 'graduation'],
  [/materials|supply|import|trade/, 'truck'],
  [/residential|villa|housing/, 'home'],
  [/government|health|hospital|defense|building|construction/, 'building'],
];

export function serviceIconName(
  icon: string | null | undefined,
  sectorSlug?: string | null,
  serviceSlug?: string | null
): string {
  if (icon && SERVICE_ICONS.some((item) => item.key === icon)) return icon;
  if (serviceSlug) {
    const match = KEYWORD_ICON.find(([pattern]) => pattern.test(serviceSlug));
    if (match) return match[1];
  }
  return (sectorSlug && DEFAULT_SECTOR_ICON[sectorSlug]) || 'briefcase';
}

export function ServiceIcon({ name, size = 20, ...props }: IconProps & { name?: string | null }) {
  const Icon = SERVICE_ICONS.find((item) => item.key === name)?.Icon ?? Briefcase;
  return <Icon size={size} {...props} />;
}
