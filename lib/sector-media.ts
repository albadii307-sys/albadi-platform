// Non-photographic uploads found in the content audit (social icon, blank
// brand sheet, and an unrelated real-estate campaign shot). Remove entries
// once management replaces them in the media library.
const GALLERY_BLOCKLIST = new Set<string>([
  'https://mstjlzblbthoamchdvly.supabase.co/storage/v1/object/public/media/sectors/89c48622-6934-466a-a8fc-2b27b21915bb.png',
  'https://mstjlzblbthoamchdvly.supabase.co/storage/v1/object/public/media/sectors/337d2dcf-01df-4d14-b03a-15a6a60896f9.png',
  'https://mstjlzblbthoamchdvly.supabase.co/storage/v1/object/public/media/sectors/1d0e17ba-cfd8-4fbc-b7c9-380c33b4d834.png',
]);

export function usableGallery(images: string[] | undefined): string[] {
  return Array.from(new Set((images ?? []).filter((url) => url && !GALLERY_BLOCKLIST.has(url))));
}

export const SECTOR_MEDIA: Record<string, { image: string; logo?: string }> = {
  contracting: { image: '/media/projects/p5.webp', logo: '/media/companies/co-contracting.webp' },
  'real-estate-development': { image: '/media/projects/p4.webp' },
  logistics: { image: '/media/projects/p7.webp' },
  'trade-services': { image: '/media/projects/p9.webp', logo: '/media/companies/co-trade.webp' },
  'hospitality-tourism': { image: '/media/projects/p10.webp', logo: '/media/companies/co-hotel.webp' },
  education: { image: '/media/projects/p2.webp', logo: '/media/companies/co-school.webp' },
  'energy-mining': { image: '/media/projects/p8.webp', logo: '/media/companies/co-mining.webp' },
  investment: { image: '/media/projects/p3.webp' },
  industry: { image: '/media/projects/p1.webp', logo: '/media/companies/co-aluminium.webp' },
};
