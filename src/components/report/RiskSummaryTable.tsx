import { CheckCircle2, AlertTriangle, XCircle, Minus } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { RiskSummaryItem, RiskLevel } from '../../types/erp.types';

interface RiskSummaryTableProps {
  items: RiskSummaryItem[];
}

const LEVEL_CONFIG: Record<RiskLevel, {
  icon: React.ReactNode;
  label: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'secondary';
  rowClass: string;
}> = {
  none: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    label: 'Non exposé',
    badgeVariant: 'success',
    rowClass: 'bg-green-50/50',
  },
  low: {
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    label: 'Faible',
    badgeVariant: 'warning',
    rowClass: 'bg-yellow-50/50',
  },
  medium: {
    icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    label: 'Moyen',
    badgeVariant: 'warning',
    rowClass: 'bg-orange-50/30',
  },
  high: {
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    label: 'Exposé',
    badgeVariant: 'danger',
    rowClass: 'bg-red-50/30',
  },
};

const categories = ['Risques naturels', 'Risques côtiers', 'Risques technologiques', 'Risques miniers', 'Pollution des sols', 'Catastrophes naturelles'];

export function RiskSummaryTable({ items }: RiskSummaryTableProps) {
  return (
    <div>
      {/* Mobile : liste de cartes */}
      <div className="sm:hidden space-y-2">
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          if (catItems.length === 0) return null;
          return catItems.map((item, idx) => {
            const config = LEVEL_CONFIG[item.niveau ?? 'none'];
            return (
              <div
                key={`${cat}-${idx}`}
                className={`rounded-lg border border-border px-3 py-2.5 flex items-center justify-between gap-3 ${config.rowClass}`}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">{cat}</p>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{item.label}</p>
                  {item.detail && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.detail}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {config.icon}
                  <Badge variant={config.badgeVariant} className="text-xs">
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          });
        })}
      </div>

      {/* Desktop : tableau */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="bg-navy-900 text-white">
              <th className="text-left px-4 py-3 font-medium">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium">Risque</th>
              <th className="text-center px-4 py-3 font-medium">Exposition</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map(cat => {
              const catItems = items.filter(i => i.category === cat);
              if (catItems.length === 0) return null;
              return catItems.map((item, idx) => {
                const config = LEVEL_CONFIG[item.niveau ?? 'none'];
                return (
                  <tr key={`${cat}-${idx}`} className={config.rowClass}>
                    {idx === 0 && (
                      <td
                        rowSpan={catItems.length}
                        className="px-4 py-3 font-medium text-navy-800 border-r border-border align-top whitespace-nowrap"
                      >
                        {cat}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-800">{item.label}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {config.icon}
                        <Badge variant={config.badgeVariant}>
                          {config.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs">
                      {item.detail ?? <Minus className="h-3 w-3 text-gray-400" />}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
