import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getProSession, getProAccount } from '../services/pro.service';
import type { ProPack } from '../services/pro.service';

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatAmount(amount_ttc: number | null): string {
  if (amount_ttc == null) return '—';
  return (amount_ttc / 100).toFixed(2).replace('.', ',') + ' €';
}

export default function ProInvoice() {
  const navigate = useNavigate();
  const session = getProSession();
  const stripeId = new URLSearchParams(window.location.search).get('id') || '';

  const [pack, setPack] = useState<ProPack | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/pro/login', { replace: true });
      return;
    }
    if (!stripeId) {
      setError('Référence de reçu manquante.');
      setLoading(false);
      return;
    }
    getProAccount(session.token)
      .then(account => {
        setEmail(account.email);
        const found = account.packs.find(p => p.stripe_id === stripeId);
        if (!found) {
          setError('Reçu introuvable. Vérifiez que vous êtes connecté avec le bon compte.');
        } else {
          setPack(found);
        }
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Erreur de chargement';
        if (msg.includes('expirée')) navigate('/pro/login', { replace: true });
        else setError(msg);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-navy-900" />
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-gray-700 text-center">{error || 'Reçu introuvable.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/pro/dashboard')}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Retour au dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Actions — masquées à l'impression */}
      <div className="print:hidden bg-slate-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/pro/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div className="flex-1" />
        <Button
          size="sm"
          className="bg-navy-900 hover:bg-navy-800 gap-1.5"
          onClick={() => window.print()}
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimer / Enregistrer en PDF
        </Button>
      </div>

      {/* Reçu imprimable */}
      <div className="max-w-2xl mx-auto px-6 py-10 print:py-0 print:px-0 print:max-w-full">
        <div className="bg-white border border-gray-200 p-8 print:border-0 print:p-0 print:shadow-none">

          {/* En-tête */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xl font-black text-navy-900">EDL&amp;DIAGNOSTIC</p>
              <p className="text-xs text-gray-400 mt-0.5">edl-diagnostic-erp.fr</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Reçu de paiement</p>
              <p className="text-sm text-gray-600">{formatDate(pack.date)}</p>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t-2 border-navy-900 mb-8" />

          {/* Informations client */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Compte professionnel</p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>

          {/* Tableau achat */}
          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="bg-slate-50 border-y border-gray-200">
                <th className="text-left py-2.5 px-3 font-semibold text-gray-700">Description</th>
                <th className="text-center py-2.5 px-3 font-semibold text-gray-700">Qté</th>
                <th className="text-right py-2.5 px-3 font-semibold text-gray-700">Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-3 text-gray-800">
                  Crédits ERP — Pack {pack.qty} ERP{pack.qty > 1 ? 's' : ''}
                  <span className="block text-xs text-gray-400 mt-0.5">Plateforme EDL&amp;DIAGNOSTIC · Espace Pro</span>
                </td>
                <td className="py-3 px-3 text-center text-gray-800">{pack.qty}</td>
                <td className="py-3 px-3 text-right font-semibold text-gray-900">
                  {formatAmount(pack.amount_ttc)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="py-3 px-3 text-right text-sm font-bold text-gray-900">
                  Total TTC
                </td>
                <td className="py-3 px-3 text-right text-base font-extrabold text-navy-900">
                  {formatAmount(pack.amount_ttc)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Référence Stripe */}
          <div className="bg-slate-50 border border-gray-200 rounded px-4 py-3 mb-8">
            <p className="text-xs text-gray-400 mb-1">Référence de transaction</p>
            <p className="text-xs font-mono text-gray-600 break-all">{pack.stripe_id}</p>
            <p className="text-xs text-gray-400 mt-1">Paiement traité par Stripe · {pack.currency.toUpperCase()}</p>
          </div>

          {/* Mentions */}
          <div className="border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 leading-relaxed">
              Ce document est un reçu de paiement électronique. Il ne constitue pas une facture au sens fiscal du terme.
              Pour toute question : <span className="text-gray-600">contact@edl-diagnostic-erp.fr</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
