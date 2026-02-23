import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, AlertCircle, CheckCircle2, PartyPopper } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ERPPreview } from '../components/report/ERPPreview';
import { getERPHistory } from '../hooks/useRiskCalculation';
import type { ERPDocument } from '../types/erp.types';

export default function Preview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [erp, setErp] = useState<ERPDocument | null>(null);

  const paymentSuccess = searchParams.get('payment') === 'success';
  const erpRef = searchParams.get('ref');

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
            className="bg-edl-700 hover:bg-edl-800"
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
          <span className="font-bold text-navy-900">EDL&DIAGNOSTIC · Aperçu ERP</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Bannière de succès paiement */}
        {paymentSuccess && (
          <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-xl p-5 animate-fade-in no-print">
            <div className="bg-green-100 rounded-full p-2 shrink-0">
              <PartyPopper className="h-6 w-6 text-green-700" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-900 text-base">
                Paiement confirmé — votre ERP est prêt !
              </p>
              <p className="text-sm text-green-800 mt-1">
                Merci pour votre achat. Téléchargez votre document ci-dessous.
                {erpRef && (
                  <span className="block text-xs text-green-600 mt-0.5 font-mono">
                    Réf. paiement : {erpRef}
                  </span>
                )}
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          </div>
        )}

        <ERPPreview document={erp} onNew={() => navigate('/generer')} />
      </div>
    </div>
  );
}
