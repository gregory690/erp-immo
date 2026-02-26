import { Check, FileDown, Tag } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { ERPMode } from '../../types/erp.types';

const FEATURES = [
  'Calcul automatique des risques (API Géorisques officielle)',
  'Document PDF téléchargeable immédiatement',
  'Conforme à l\'arrêté du 27/09/2022',
  'Validité 6 mois · prêt à annexer au compromis',
  'Références cadastrales incluses',
  'Historique des arrêtés CatNat depuis 1982',
];

interface ServiceSelectorProps {
  selected: ERPMode | null;
  onSelect: (mode: ERPMode) => void;
  onConfirm: () => void;
}

export function ServiceSelector({ selected, onSelect, onConfirm }: ServiceSelectorProps) {
  const isSelected = selected === 'edition';

  return (
    <div className="space-y-4">
      {/* Unique offer card — mt-5 pour laisser la place au badge absolu */}
      <Card
        className={`relative cursor-pointer transition-all border-2 mt-5 ${
          isSelected
            ? 'border-navy-900 ring-2 ring-navy-900/20'
            : 'border-orange-300 hover:border-navy-400'
        }`}
        onClick={() => onSelect('edition')}
      >
        {/* Top badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <Badge className="bg-navy-900 text-white text-xs px-3 shadow-sm">
            ✓ Prêt en moins de 2 minutes
          </Badge>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left — icon + title + description */}
            <div className="flex items-start gap-3 min-w-0">
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

            {/* Radio indicator */}
            <div
              className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                isSelected ? 'border-navy-900 bg-navy-900' : 'border-gray-300'
              }`}
            >
              {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </div>
          </div>

          {/* Price block */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <Tag className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-500 line-through decoration-red-400 decoration-2 font-medium">
                  30,00 €
                </span>
                <span className="text-xs text-gray-400 italic hidden sm:inline">
                  (prix moyen facturé par votre diagnostiqueur)
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-navy-900">19,99 €</span>
                <span className="text-sm text-gray-500 font-medium">TTC</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">16,66 € HT</p>
            </div>
            <div className="sm:ml-auto flex sm:flex-col items-center sm:items-end gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold text-sm shrink-0">
                Économisez 10 €
              </Badge>
              <p className="text-xs text-gray-500">Téléchargement immédiat</p>
            </div>
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
        <span>✓ Paiement sécurisé Stripe</span>
        <span>✓ Données officielles Géorisques</span>
        <span>✓ Document légalement conforme</span>
      </div>

      {/* Desktop only — on mobile the button is in the sticky bottom bar */}
      <Button
        onClick={onConfirm}
        disabled={!isSelected}
        size="lg"
        className="hidden sm:flex w-full bg-edl-700 hover:bg-edl-800 text-base font-semibold h-12"
      >
        Télécharger mon ERP · 19,99 €
      </Button>
    </div>
  );
}
