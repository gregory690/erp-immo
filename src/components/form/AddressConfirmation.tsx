import { useEffect } from 'react';
import { MapPin, Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMapInteraction } from '../../hooks/useMapInteraction';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CadastreInfo {
  section: string;
  numero: string;
  departement: string;
  identifiant: string;
}

interface AddressConfirmationProps {
  lat: number;
  lng: number;
  adresse: string;
  commune: string;
  codePostal: string;
  codeInsee: string;
  cadastre: CadastreInfo | null;
  cadastreLoading: boolean;
  cadastreError: string | null;
  onCoordsChange: (coords: { lat: number; lng: number }) => void;
}

export function AddressConfirmation({
  lat,
  lng,
  adresse,
  commune,
  codePostal,
  codeInsee,
  cadastre,
  cadastreLoading,
  cadastreError,
  onCoordsChange,
}: AddressConfirmationProps) {
  const { mapContainerRef, flyToCoords } = useMapInteraction({
    initialCoords: { lng, lat },
    zoom: 16,
    draggable: true,
    onCoordsChange,
    debounceMs: 500,
  });

  // Fly when parent updates coords
  useEffect(() => {
    flyToCoords({ lng, lat }, 16);
  }, [lat, lng]);

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-border shadow-sm">
        <div
          ref={mapContainerRef}
          className="h-[240px] sm:h-[380px] w-full"
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Déplacez le marqueur pour affiner la localisation — le calcul des risques sera mis à jour automatiquement
      </p>

      {/* Address details */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-edl-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{adresse}</p>
              <p className="text-sm text-gray-600">{codePostal} {commune}</p>
              <p className="text-xs text-gray-400 mt-0.5">Code INSEE : {codeInsee}</p>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-edl-700" />
              <span className="text-sm font-medium text-gray-700">Références cadastrales</span>
            </div>

            {cadastreLoading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="relative shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-900">Interrogation des données cadastrales…</p>
                    <p className="text-[10px] text-blue-600 mt-0.5">Source officielle : IGN · apicarto.ign.fr</p>
                  </div>
                  <div className="flex items-end gap-0.5 shrink-0 pb-0.5">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-blue-400 animate-bounce"
                        style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {cadastreError && !cadastreLoading && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Références cadastrales non disponibles — saisie manuelle possible</span>
              </div>
            )}

            {cadastre && !cadastreLoading && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono">
                  Section {cadastre.section}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  Parcelle n° {cadastre.numero}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {cadastre.identifiant}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-1">
            <span>Lat : {lat.toFixed(6)}</span>
            <span>Lng : {lng.toFixed(6)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
