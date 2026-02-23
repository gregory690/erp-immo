import { AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { CatNatArrete } from '../../types/georisques.types';

interface CatNatHistoryProps {
  arretes: CatNatArrete[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function CatNatHistory({ arretes }: CatNatHistoryProps) {
  if (arretes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Calendar className="h-8 w-8 mb-2" />
        <p className="text-sm">Aucun arrêté de catastrophe naturelle recensé pour cette commune depuis 1982.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-medium text-gray-700">
          {arretes.length} arrêté{arretes.length > 1 ? 's' : ''} de catastrophe naturelle depuis 1982
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Type de sinistre</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Début</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Fin</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Arrêté JO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {arretes.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2.5">
                  <span className="text-xs font-medium text-gray-800">{a.libRisqueJo}</span>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600 hidden sm:table-cell">
                  {formatDate(a.datDebutEvt)}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600 hidden sm:table-cell">
                  {formatDate(a.datFinEvt)}
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant="warning" className="text-xs">
                    {formatDate(a.datPubliArrete)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
