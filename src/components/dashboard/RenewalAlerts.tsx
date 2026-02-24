import { Bell, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { isERPExpired, isERPNearExpiry, formatERPReference } from '../../utils/erp-validator';
import type { ERPDocument } from '../../types/erp.types';
import { useNavigate } from 'react-router-dom';

interface RenewalAlertsProps {
  history: ERPDocument[];
}

export function RenewalAlerts({ history }: RenewalAlertsProps) {
  const navigate = useNavigate();
  const alerts = history.filter(e => isERPExpired(e) || isERPNearExpiry(e));

  if (alerts.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-orange-600" />
          <h3 className="text-sm font-semibold text-orange-900">
            {alerts.length} ERP à renouveler
          </h3>
        </div>
        <div className="space-y-2">
          {alerts.map(erp => {
            const expired = isERPExpired(erp);
            return (
              <div
                key={erp.metadata.reference}
                className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-orange-100"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${expired ? 'text-red-500' : 'text-orange-500'}`} />
                  <div>
                    <p className="text-xs font-medium text-gray-800 truncate max-w-[140px] sm:max-w-[200px]">
                      {erp.bien.commune} — {formatERPReference(erp.metadata.reference)}
                    </p>
                    <Badge variant={expired ? 'danger' : 'warning'} className="text-xs mt-0.5">
                      {expired ? 'Expiré' : 'Expire dans < 30 jours'}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => navigate('/generer')}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Renouveler
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
