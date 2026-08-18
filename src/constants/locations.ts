export type LocationTab = {
  id: string;
  type: 'current' | 'added';
  name: string;
  lat: number;
  lng: number;
  region: string;
  precision: 'gps' | 'address';
};