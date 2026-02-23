import type { BANResponse, BANSearchOptions } from '../types/ban.types';

const BAN_BASE_URL = 'https://api-adresse.data.gouv.fr';

export async function searchAddress(
  query: string,
  options: BANSearchOptions = {}
): Promise<BANResponse> {
  if (!query || query.trim().length < 3) {
    return { type: 'FeatureCollection', features: [], attribution: '', licence: '', query, limit: 0 };
  }

  const params = new URLSearchParams({ q: query.trim() });
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  if (options.autocomplete !== undefined) params.set('autocomplete', String(options.autocomplete));
  if (options.lat !== undefined) params.set('lat', String(options.lat));
  if (options.lon !== undefined) params.set('lon', String(options.lon));
  if (options.type) params.set('type', options.type);
  if (options.postcode) params.set('postcode', options.postcode);
  if (options.citycode) params.set('citycode', options.citycode);

  const res = await fetch(`${BAN_BASE_URL}/search/?${params.toString()}`);
  if (!res.ok) throw new Error(`BAN API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function reverseGeocode(lon: number, lat: number): Promise<BANResponse> {
  const params = new URLSearchParams({ lon: String(lon), lat: String(lat) });
  const res = await fetch(`${BAN_BASE_URL}/reverse/?${params.toString()}`);
  if (!res.ok) throw new Error(`BAN reverse error: ${res.status}`);
  return res.json();
}
