import { FileText, ExternalLink, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { formatERPReference, isERPExpired, isERPNearExpiry } from '../../utils/erp-validator';
import type { ERPDocument } from '../../types/erp.types';

interface OrderHistoryProps {
  history: ERPDocument[];
  onView?: (erp: ERPDocument) => void;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const MODE_LABELS: Record<string, string> = {
  edition: 'Self-service',
  commande: 'Expert',
  expert: 'Pack Expert',
};

export function OrderHistory({ history, onView }: OrderHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <FileText className="h-10 w-10 mb-3" />
        <p className="text-sm font-medium">Aucun ERP généré</p>
        <p className="text-xs mt-1">Vos ERP apparaîtront ici après leur génération.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((erp, i) => {
        const expired = isERPExpired(erp);
        const nearExpiry = !expired && isERPNearExpiry(erp);

        return (
          <Card key={erp.metadata.reference ?? i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-navy-50 rounded-lg p-2 shrink-0">
                  <FileText className="h-5 w-5 text-navy-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {erp.bien.adresse_complete}
                      </p>
                      <p className="text-xs text-gray-500">
                        {erp.bien.code_postal} {erp.bien.commune}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {MODE_LABELS[erp.metadata.mode] ?? erp.metadata.mode}
                      </Badge>
                      {expired ? (
                        <Badge variant="danger" className="text-xs">Expiré</Badge>
                      ) : nearExpiry ? (
                        <Badge variant="warning" className="text-xs">Expire bientôt</Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">Valide</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="font-mono">{formatERPReference(erp.metadata.reference)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(erp.metadata.date_realisation)}
                    </span>
                    {!expired && (
                      <span>Expire le {formatDate(erp.metadata.validite_jusqu_au)}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {onView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(erp)}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Voir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
