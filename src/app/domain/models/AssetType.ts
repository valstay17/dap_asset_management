export interface AssetType {
  id: string;
  name: string;
}

export type NewAssetType = Omit<AssetType, 'id'>;
