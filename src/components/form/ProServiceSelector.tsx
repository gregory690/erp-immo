import { Check, FileDown, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  'Calcul automatique des risques (API Géorisques officielle)',
  'Document PDF téléchargeable immédiatement',
  'Conforme à l\'arrêté du 27/09/2022',
  'Validité 6 mois · prêt à annexer au compromis',
  'Références cadastrales incluses',
  'Historique des arrêtés CatNat depuis 1982',
];

interface ProServiceSelectorProps {
  credits: number;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

export function ProServiceSelector({ credits, onConfirm, loading = false, error = null }: ProServiceSelectorProps) {
  const navigate = useNavigate();
  const hasCredits = credits > 0;

  return (
    <div className="space-y-4">
      <Card className="relative border-2 border-navy-900 mt-5">
        {/* Top badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <Badge className="bg-navy-900 text-white text-xs px-3 shadow-sm">
            <Zap className="h-3 w-3 mr-1.5" />
            Compte Pro · Tarif préférentiel
          </Badge>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-navy-50 rounded-lg p-2 shrink-0">
              <FileDown className="h-5 w-5 text-navy-900" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-navy-900 text-sm sm:text-base leading-snug">
                ERP en ligne · Téléchargement immédiat
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Générez et téléchargez votre État des Risques et Pollutions en moins de 2 minutes.
              </p>
            </div>
          </div>

          {/* Credit info */}
          <div className={`rounded-xl px-4 py-3 border ${hasCredits ? 'bg-navy-900 border-navy-900' : 'bg-amber-50 border-amber-200'}`}>
            {hasCredits ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-semibold">1 crédit sera utilisé</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Il vous restera {credits - 1} crédit{credits - 1 !== 1 ? 's' : ''} après cette génération
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-xs font-medium">Solde actuel</p>
                  <p className="text-white text-2xl font-extrabold">{credits}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-amber-800 text-sm font-semibold">Crédits épuisés</p>
                  <p className="text-amber-700 text-xs">Rechargez votre compte pour continuer.</p>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Social proof */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 text-center">
        <span>✓ Document légalement conforme</span>
        <span>✓ Données officielles Géorisques</span>
        <span>✓ Accès depuis votre espace pro</span>
      </div>

      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}

      {hasCredits ? (
        <Button
          onClick={onConfirm}
          disabled={loading}
          size="lg"
          className="hidden sm:flex w-full bg-navy-900 hover:bg-navy-800 text-base font-semibold h-12"
        >
          {loading ? 'Génération en cours…' : 'Générer mon ERP (1 crédit)'}
        </Button>
      ) : (
        <Button
          onClick={() => navigate('/pro/dashboard')}
          size="lg"
          className="hidden sm:flex w-full bg-amber-500 hover:bg-amber-600 text-white text-base font-semibold h-12"
        >
          Recharger mes crédits →
        </Button>
      )}
    </div>
  );
}
