import { Check, Zap, Clock, Shield } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { ServiceOption, ERPMode } from '../../types/erp.types';

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'edition',
    title: 'Édition Self-Service',
    description: 'Vous validez les informations et téléchargez immédiatement votre ERP.',
    price_ht: 0,
    price_ttc: 0,
    delay: 'Immédiat',
    recommended: false,
    features: [
      'Calcul automatique des risques',
      'Document PDF téléchargeable',
      'Validité 6 mois',
      'Conforme arrêté 27/09/2022',
    ],
  },
  {
    id: 'commande',
    title: 'Commande Expert',
    description: 'Un expert vérifie les données et vous retourne l\'ERP certifié en moins d\'1h.',
    price_ht: 29,
    price_ttc: 34.8,
    delay: '< 1 heure',
    recommended: true,
    features: [
      'Vérification par un expert immobilier',
      'ERP certifié avec tampon professionnel',
      'Responsabilité professionnelle engagée',
      'Support téléphonique inclus',
    ],
  },
  {
    id: 'expert',
    title: 'Pack Expert Complet',
    description: 'ERP + diagnostic complet + conseil juridique personnalisé.',
    price_ht: 79,
    price_ttc: 94.8,
    delay: '< 4 heures',
    recommended: false,
    features: [
      'Tout de la formule Expert',
      'Diagnostic multi-risques approfondi',
      'Consultation juridique 30 min',
      'Archivage 10 ans',
    ],
  },
];

interface ServiceSelectorProps {
  selected: ERPMode | null;
  onSelect: (mode: ERPMode) => void;
  onConfirm: () => void;
}

const ICON_MAP: Record<ERPMode, React.ReactNode> = {
  edition: <Zap className="h-5 w-5" />,
  commande: <Clock className="h-5 w-5" />,
  expert: <Shield className="h-5 w-5" />,
};

export function ServiceSelector({ selected, onSelect, onConfirm }: ServiceSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {SERVICE_OPTIONS.map(option => (
          <Card
            key={option.id}
            className={cn(
              'relative cursor-pointer transition-all border-2',
              selected === option.id
                ? 'border-navy-900 ring-2 ring-navy-900/20'
                : 'border-border hover:border-navy-300',
              option.recommended && selected !== option.id ? 'border-navy-300' : ''
            )}
            onClick={() => onSelect(option.id)}
          >
            {option.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-navy-900 text-white text-xs px-3">
                  Recommandé
                </Badge>
              </div>
            )}

            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-navy-900">
                  {ICON_MAP[option.id]}
                  <h3 className="font-semibold text-sm">{option.title}</h3>
                </div>
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                    selected === option.id
                      ? 'border-navy-900 bg-navy-900'
                      : 'border-gray-300'
                  )}
                >
                  {selected === option.id && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-600">{option.description}</p>

              <div>
                {option.price_ttc === 0 ? (
                  <p className="text-2xl font-bold text-navy-900">Gratuit</p>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-navy-900">
                      {option.price_ttc.toFixed(2)} €<span className="text-sm font-normal text-gray-500"> TTC</span>
                    </p>
                    <p className="text-xs text-gray-500">{option.price_ht} € HT</p>
                  </div>
                )}
                <Badge variant="secondary" className="mt-1 text-xs">
                  {option.delay}
                </Badge>
              </div>

              <ul className="space-y-1.5">
                {option.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-700">
                    <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={onConfirm}
        disabled={!selected}
        size="lg"
        className="w-full bg-navy-900 hover:bg-navy-800"
      >
        Générer mon ERP
      </Button>
    </div>
  );
}
