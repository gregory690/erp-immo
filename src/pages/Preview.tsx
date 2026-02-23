import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ERPPreview } from '../components/report/ERPPreview';
import { getERPHistory } from '../hooks/useRiskCalculation';
import type { ERPDocument } from '../types/erp.types';

export default function Preview() {
  const navigate = useNavigate();
  const [erp, setErp] = useState<ERPDocument | null>(null);

  useEffect(() => {
    const history = getERPHistory();
    if (history.length > 0) {
      setErp(history[0]);
    }
  }, []);

  if (!erp) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">Aucun ERP trouvé.</p>
          <Button
            className="bg-navy-900 hover:bg-navy-800"
            onClick={() => navigate('/generer')}
          >
            Générer un ERP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-border sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/generer')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
          <span className="font-semibold text-navy-900">Aperçu ERP</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ERPPreview document={erp} onNew={() => navigate('/generer')} />
      </div>
    </div>
  );
}
