import { useEffect } from 'react';
import { MapPin, Building2, AlertCircle, RefreshCw, Move } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
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
  onRetryCadastre?: () => void;
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
  onRetryCadastre,
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
      {/* Instruction drag */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Move className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Vérifiez la position du marqueur.</span> Si besoin, déplacez-le sur la carte pour affiner la localisation. Les risques seront recalculés automatiquement.
        </p>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-border shadow-sm">
        <div
          ref={mapContainerRef}
          className="h-[240px] sm:h-[380px] w-full"
        />
      </div>

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
              <div className="rounded-xl bg-navy-900 p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">Interrogation des données cadastrales</p>
                    <p className="text-xs text-white/50 mt-0.5">Source officielle : IGN · apicarto.ign.fr</p>
                  </div>
                  <div className="flex items-end gap-1 shrink-0">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full bg-white/50 animate-bounce"
                        style={{ height: `${10 + i * 3}px`, animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Barre glissante indeterminate */}
                <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full w-2/5 bg-blue-400 rounded-full"
                    style={{ animation: 'cadastre-slide 1.8s ease-in-out infinite' }}
                  />
                </div>

                <p className="text-[10px] text-white/35 text-center tracking-wide">Quelques secondes…</p>
              </div>
            )}

            {cadastreError && !cadastreLoading && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-orange-700 leading-relaxed">
                    Service cadastral IGN indisponible · les références ne figureront pas dans le PDF.
                  </p>
                  {onRetryCadastre && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 text-xs gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={onRetryCadastre}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Réessayer
                    </Button>
                  )}
                </div>
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
