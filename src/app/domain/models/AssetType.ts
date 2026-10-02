export interface AssetType {
  id: string;
  name: string;
  active: boolean;
}

export type NewAssetType = Pick<AssetType, 'name'>;
