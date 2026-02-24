import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { OrderHistory } from '../components/dashboard/OrderHistory';
import { RenewalAlerts } from '../components/dashboard/RenewalAlerts';
import { ERPPreview } from '../components/report/ERPPreview';
import { getERPHistory } from '../hooks/useRiskCalculation';
import type { ERPDocument } from '../types/erp.types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ERPDocument[]>([]);
  const [selected, setSelected] = useState<ERPDocument | null>(null);

  useEffect(() => {
    setHistory(getERPHistory());
  }, []);

  function handleView(erp: ERPDocument) {
    setSelected(erp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const validCount = history.filter(e => new Date(e.metadata.validite_jusqu_au) > new Date()).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Accueil
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-navy-700" />
            <span className="font-bold text-navy-900">Mes documents ERP</span>
          </div>
          <Button
            size="sm"
            className="bg-edl-700 hover:bg-edl-800"
            onClick={() => navigate('/generer')}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Nouvel ERP
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-navy-900">{history.length}</p>
              <p className="text-xs text-gray-500 mt-1">ERP générés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-green-700">{validCount}</p>
              <p className="text-xs text-gray-500 mt-1">ERP valides</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-orange-600">{history.length - validCount}</p>
              <p className="text-xs text-gray-500 mt-1">ERP expirés</p>
            </CardContent>
          </Card>
        </div>

        {/* Renewal alerts */}
        <RenewalAlerts history={history} />

        {/* Selected ERP preview */}
        {selected && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">ERP sélectionné</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Fermer
              </Button>
            </div>
            <ERPPreview document={selected} />
            <Separator className="my-6" />
          </div>
        )}

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique des ERP</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderHistory history={history} onView={handleView} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
