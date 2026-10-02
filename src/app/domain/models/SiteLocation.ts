export type Floor = 'planta-alta' | 'planta-baja';

export interface SiteLocation {
  id: string;
  address: string;
  building: string;
  floor?: Floor;
  active: boolean;
}

export type NewSiteLocation = Omit<SiteLocation, 'id' | 'active'>;

const FLOOR_LABELS: Record<Floor, string> = {
  'planta-alta': 'Planta alta',
  'planta-baja': 'Planta baja',
};

export function formatLocationLabel(location: Pick<SiteLocation, 'building' | 'address' | 'floor'>): string {
  const base = `${location.building} — ${location.address}`;
  return location.floor ? `${base} (${FLOOR_LABELS[location.floor]})` : base;
}

export function formatBuildingLabel(location: Pick<SiteLocation, 'building' | 'floor'>): string {
  return location.floor ? `${location.building} (${FLOOR_LABELS[location.floor]})` : location.building;
}
