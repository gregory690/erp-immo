import { useEffect } from 'react';
import { MapPin, Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
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
          style={{ height: '380px', width: '100%' }}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Déplacez le marqueur pour affiner la localisation — le calcul des risques sera mis à jour automatiquement
      </p>

      {/* Address details */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-navy-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{adresse}</p>
              <p className="text-sm text-gray-600">{codePostal} {commune}</p>
              <p className="text-xs text-gray-400 mt-0.5">Code INSEE : {codeInsee}</p>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-navy-700" />
              <span className="text-sm font-medium text-gray-700">Références cadastrales</span>
            </div>

            {cadastreLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
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
