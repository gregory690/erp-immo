export interface BANFeatureProperties {
  label: string;
  score: number;
  housenumber?: string;
  id: string;
  name: string;
  postcode: string;
  citycode: string; // INSEE code
  city: string;
  context: string;
  type: 'housenumber' | 'street' | 'locality' | 'municipality';
  importance: number;
  street?: string;
  x: number; // Lambert-93
  y: number; // Lambert-93
}

export interface BANFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] - GeoJSON standard
  };
  properties: BANFeatureProperties;
}

export interface BANResponse {
  type: 'FeatureCollection';
  features: BANFeature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
}

export interface BANSearchOptions {
  limit?: number;
  autocomplete?: 0 | 1;
  lat?: number;
  lon?: number;
  type?: 'housenumber' | 'street' | 'locality' | 'municipality';
  postcode?: string;
  citycode?: string;
}
