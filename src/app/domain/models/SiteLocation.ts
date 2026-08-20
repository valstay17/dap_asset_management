export type Floor = 'planta-alta' | 'planta-baja';

export interface SiteLocation {
  id: string;
  address: string;
  building: string;
  floor?: Floor;
}

export type NewSiteLocation = Omit<SiteLocation, 'id'>;

const FLOOR_LABELS: Record<Floor, string> = {
  'planta-alta': 'Planta alta',
  'planta-baja': 'Planta baja',
};

export function formatLocationLabel(location: SiteLocation): string {
  const base = `${location.building} — ${location.address}`;
  return location.floor ? `${base} (${FLOOR_LABELS[location.floor]})` : base;
}

export function formatBuildingLabel(location: SiteLocation): string {
  return location.floor ? `${location.building} (${FLOOR_LABELS[location.floor]})` : location.building;
}
