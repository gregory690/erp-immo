import { FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Prescription } from '../../types/erp.types';

interface PrescriptionsSectionProps {
  prescriptions: Prescription[];
}

const TYPE_COLORS: Record<string, string> = {
  'PPR Naturel': 'bg-blue-100 text-blue-800',
  'PPR Technologique': 'bg-purple-100 text-purple-800',
  'Risque sismique': 'bg-orange-100 text-orange-800',
  'Retrait-gonflement des argiles': 'bg-yellow-100 text-yellow-800',
  'Secteur d\'Information des Sols (SIS)': 'bg-red-100 text-red-800',
};

export function PrescriptionsSection({ prescriptions }: PrescriptionsSectionProps) {
  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <FileText className="h-8 w-8 mb-2 text-green-500" />
        <p className="text-sm font-medium text-green-700">Aucune prescription de travaux applicable</p>
        <p className="text-xs text-gray-500 mt-1">Le bien n'est pas soumis à des travaux réglementaires obligatoires au titre des risques.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Les prescriptions suivantes s'appliquent au bien en raison de son exposition aux risques identifiés.
        Consultez le règlement des PPR concernés pour les détails des travaux obligatoires.
      </p>

      {prescriptions.map((p, i) => (
        <Card key={i} className="border-l-4 border-l-orange-400">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[p.type] ?? 'bg-gray-100 text-gray-800'}`}
                  >
                    {p.type}
                  </span>
                  {p.page_reglement && (
                    <Badge variant="outline" className="text-xs">
                      Règlement p.{p.page_reglement}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{p.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-gray-500 italic pt-2">
        * Les prescriptions listées sont indicatives. Consultez la mairie ou la préfecture pour obtenir le règlement complet du PPR applicable.
      </p>
    </div>
  );
}
