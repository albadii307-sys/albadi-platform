import { getAllSectors, getCompanies } from './queries';

export async function getRelationOptions() {
  const [sectors, companies] = await Promise.all([getAllSectors(), getCompanies()]);
  return {
    sectors: sectors.map((sector) => ({ id: sector.id, label: sector.name_ar })),
    companies: companies.map((company) => ({ id: company.id, label: company.name_ar })),
  };
}
