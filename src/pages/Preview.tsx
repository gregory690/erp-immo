import { useEffect, useRef, useState } from 'react';
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

  // Auto-email déclenché depuis la page succès (via send-erp-email.js synchrone)
  const [autoEmailStatus, setAutoEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [autoEmailAddress, setAutoEmailAddress] = useState<string | null>(null);
  const autoEmailTriggered = useRef(false);

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

  // ─── Auto-envoi email après paiement ──────────────────────────────────────
  // Attend que l'ERP soit chargé, récupère customer_email depuis KV (stocké par
  // stripe-webhook.js ou get-erp-document.js Case 3), puis déclenche l'envoi.
  useEffect(() => {
    if (!paymentSuccess || !erpRef || !erp || autoEmailTriggered.current) return;
    autoEmailTriggered.current = true;
    setAutoEmailStatus('sending');

    const erpSnapshot = erp; // capture non-null values before async closure
    const erpRefSnapshot = erpRef;
    let cancelled = false;

    async function doAutoEmail() {
      try {
        // Retry jusqu'à 4 tentatives pour gérer la race condition entre le webhook
        // Stripe (qui stocke customer_email dans KV) et le chargement de la page.
        let customerEmail: string | undefined;
        const maxAttempts = 4;
        const retryDelay = 3000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          if (cancelled) return;

          const response = await fetch(`/api/get-erp-document?ref=${encodeURIComponent(erpRefSnapshot)}`);
          if (!response.ok) throw new Error('fetch failed');
          const kvDoc = await response.json() as Record<string, unknown>;

          customerEmail = kvDoc.customer_email as string | undefined;
          if (customerEmail) break;

          // Pas encore disponible → attendre avant de réessayer
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }

        if (!customerEmail) throw new Error('customer_email introuvable dans KV après retries');
        if (cancelled) return;

        setAutoEmailAddress(customerEmail);
        await sendERPByEmail(customerEmail, erpSnapshot);

        if (!cancelled) setAutoEmailStatus('sent');
      } catch {
        if (!cancelled) {
          setAutoEmailStatus('error');
          setShowAltEmailForm(true); // Ouvre le formulaire manuel en fallback
        }
      }
    }

    doAutoEmail();
    return () => { cancelled = true; };
  }, [paymentSuccess, erpRef, erp]);

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
          {!paymentSuccess && (
            <button
              onClick={() => navigate('/generer')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </button>
          )}
          {paymentSuccess && <div className="w-16" />}
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
                  Paiement confirmé · votre ERP est prêt !
                </p>
                {erpRef && (
                  <span className="text-xs text-green-600 font-mono">
                    Réf. : {formatERPReference(erpRef)}
                  </span>
                )}
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            </div>

            {/* Notification envoi automatique — état dynamique */}
            {autoEmailStatus === 'sending' && (
              <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-green-600 shrink-0" />
                <p className="text-sm text-green-900">
                  <span className="font-semibold">Génération du PDF et envoi de l'email en cours…</span> cela prend généralement 10 à 20 secondes.
                </p>
              </div>
            )}
            {autoEmailStatus === 'sent' && (
              <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg px-4 py-3">
                <div className="bg-green-100 rounded-full p-1.5 shrink-0">
                  <Mail className="h-4 w-4 text-green-700" />
                </div>
                <div className="text-sm text-green-900 space-y-0.5">
                  <p>
                    <span className="font-semibold">Email envoyé</span>
                    {autoEmailAddress ? ` à ${autoEmailAddress}` : ' automatiquement'} · conservez-le pour retrouver votre ERP à tout moment.
                  </p>
                  <p className="text-xs text-green-700">Si vous ne le recevez pas dans les prochaines minutes, vérifiez vos <span className="font-semibold">spams ou courriers indésirables</span>.</p>
                </div>
              </div>
            )}
            {autoEmailStatus === 'error' && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="bg-amber-100 rounded-full p-1.5 shrink-0">
                  <Mail className="h-4 w-4 text-amber-700" />
                </div>
                <p className="text-sm text-amber-900">
                  L'envoi automatique a échoué · utilisez le formulaire ci-dessous pour recevoir votre ERP par email.
                </p>
              </div>
            )}

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
