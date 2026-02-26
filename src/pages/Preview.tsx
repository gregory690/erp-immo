import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, AlertCircle, CheckCircle2, PartyPopper, Mail, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ERPPreview } from '../components/report/ERPPreview';
import { getERPHistory } from '../hooks/useRiskCalculation';
import { sendERPByEmail, fetchERPByReference } from '../services/email.service';
import { formatERPReference } from '../utils/erp-validator';
import type { ERPDocument } from '../types/erp.types';

export default function Preview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [erp, setErp] = useState<ERPDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // État formulaire email (envoi à une autre adresse)
  const [showAltEmailForm, setShowAltEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const paymentSuccess = searchParams.get('payment') === 'success';
  const erpRef = searchParams.get('ref');
  const autoPrint = searchParams.get('autoprint') === 'true';

  useEffect(() => {
    if (paymentSuccess) {
      (window as any).plausible?.('Paiement confirmé', { revenue: { currency: 'EUR', amount: 19.99 } });
    }
  }, [paymentSuccess]);

  useEffect(() => {
    async function loadERP() {
      // 1. Essayer d'abord depuis localStorage
      const history = getERPHistory();
      if (history.length > 0) {
        setErp(history[0]);
        setLoading(false);
        return;
      }

      // 2. Si localStorage vide mais ref dans l'URL → tenter le serveur
      if (erpRef) {
        try {
          const doc = await fetchERPByReference(erpRef);
          if (doc) {
            setErp(doc);
            setLoading(false);
            return;
          }
        } catch {
          // Silencieux — on affiche l'état vide en dessous
        }
      }

      setLoading(false);
    }

    loadERP();
  }, [erpRef]);

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!erp || !email) return;
    setEmailError(null);
    setEmailSending(true);
    try {
      await sendERPByEmail(email, erp);
      setEmailSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setEmailSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-edl-700" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <header className="bg-white border-b border-border sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/generer')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
          <span className="font-bold text-navy-900">EDL&amp;DIAGNOSTIC · Aperçu ERP</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Bannière succès paiement */}
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 no-print space-y-4">

            {/* En-tête */}
            <div className="flex items-start gap-4">
              <div className="bg-green-100 rounded-full p-2 shrink-0">
                <PartyPopper className="h-6 w-6 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-900 text-base">
                  Paiement confirmé — votre ERP est prêt !
                </p>
                {erpRef && (
                  <span className="text-xs text-green-600 font-mono">
                    Réf. : {formatERPReference(erpRef)}
                  </span>
                )}
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            </div>

            {/* Notification envoi automatique */}
            <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg px-4 py-3">
              <div className="bg-green-100 rounded-full p-1.5 shrink-0">
                <Mail className="h-4 w-4 text-green-700" />
              </div>
              <div className="text-sm text-green-900 space-y-0.5">
                <p><span className="font-semibold">Email envoyé automatiquement</span> à l'adresse renseignée lors du paiement — conservez-le pour retrouver votre ERP à tout moment.</p>
                <p className="text-xs text-green-700">Si vous ne le recevez pas dans les prochaines minutes, pensez à vérifier vos <span className="font-semibold">spams ou courriers indésirables</span>.</p>
              </div>
            </div>

            {/* Option secondaire : envoyer à une autre adresse */}
            <div className="border-t border-green-200 pt-3">
              {!showAltEmailForm && !emailSent && (
                <button
                  onClick={() => setShowAltEmailForm(true)}
                  className="text-sm text-green-700 underline underline-offset-2 hover:text-green-900 transition-colors"
                >
                  Envoyer à une autre adresse email
                </button>
              )}

              {showAltEmailForm && !emailSent && (
                <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row gap-2 mt-1">
                  <div className="flex-1 flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
                    <Mail className="h-4 w-4 text-green-600 shrink-0" />
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="Autre adresse email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={emailSending || !email}
                    className="bg-green-700 hover:bg-green-800 text-white font-semibold shrink-0"
                    size="sm"
                  >
                    {emailSending ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Envoi…</>
                    ) : (
                      <><Mail className="h-3.5 w-3.5 mr-1" /> Envoyer</>
                    )}
                  </Button>
                </form>
              )}

              {emailSent && (
                <div className="flex items-center gap-2 text-green-700 mt-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">
                    Email envoyé à <strong>{email}</strong>
                  </p>
                </div>
              )}

              {emailError && (
                <p className="text-xs text-red-600 mt-2">{emailError}</p>
              )}
            </div>
          </div>
        )}

        <ERPPreview document={erp} onNew={() => navigate('/generer')} emailSent={emailSent} autoprint={autoPrint} />
      </div>
    </div>
  );
}
