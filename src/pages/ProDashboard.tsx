import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Plus, ExternalLink, Loader2, AlertCircle, LogOut,
  CreditCard, Check, ChevronRight, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  getProSession, clearProSession,
  getProAccount, createProCheckout,
} from '../services/pro.service';
import type { ProAccount } from '../services/pro.service';

const PACKS = [
  { id: 'pack_10' as const, label: 'Pack 10 ERPs', price: '94,80 €', perUnit: '7,90 € HT / ERP', qty: 10 },
  { id: 'pack_50' as const, label: 'Pack 50 ERPs', price: '238,80 €', perUnit: '3,98 € HT / ERP', qty: 50, recommended: true },
];

export default function ProDashboard() {
  const navigate = useNavigate();
  const session = getProSession();

  const [account, setAccount] = useState<ProAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packLoading, setPackLoading] = useState<string | null>(null);
  const [packError, setPackError] = useState<string | null>(null);
  const [showPacks, setShowPacks] = useState(false);

  const packSuccess = new URLSearchParams(window.location.search).get('pack_success') === '1';

  useEffect(() => {
    if (!session) {
      navigate('/pro/login', { replace: true });
      return;
    }
    loadAccount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAccount() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProAccount(session.token);
      setAccount(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de chargement';
      if (msg.includes('expirée')) {
        navigate('/pro/login', { replace: true });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyPack(packId: 'pack_10' | 'pack_50') {
    if (!session) return;
    setPackError(null);
    setPackLoading(packId);
    try {
      const { url } = await createProCheckout(packId, session.token);
      window.location.href = url;
    } catch (err) {
      setPackError(err instanceof Error ? err.message : 'Erreur de paiement');
      setPackLoading(null);
    }
  }

  function handleLogout() {
    clearProSession();
    navigate('/pro/login', { replace: true });
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-navy-900 text-sm">
            <span className="hidden sm:inline">EDL&amp;DIAGNOSTIC · </span>Espace Pro
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{session.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Success banner */}
        {packSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-800">
              Paiement confirmé — vos crédits ont été ajoutés !
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={loadAccount} className="text-xs text-red-600 underline shrink-0">Réessayer</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-navy-900" />
          </div>
        ) : account && (
          <>
            {/* Credits banner */}
            <div className={`rounded-xl p-5 sm:p-6 ${account.credits > 0 ? 'bg-navy-900' : 'bg-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-5 w-5 ${account.credits > 0 ? 'text-amber-400' : 'text-gray-500'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${account.credits > 0 ? 'text-white/60' : 'text-gray-500'}`}>
                      Crédits disponibles
                    </span>
                  </div>
                  <p className={`text-4xl font-extrabold ${account.credits > 0 ? 'text-white' : 'text-gray-600'}`}>
                    {account.credits}
                    <span className={`text-base font-normal ml-2 ${account.credits > 0 ? 'text-white/50' : 'text-gray-400'}`}>
                      ERP{account.credits !== 1 ? 's' : ''}
                    </span>
                  </p>
                  {account.used > 0 && (
                    <p className={`text-xs ${account.credits > 0 ? 'text-white/40' : 'text-gray-400'}`}>
                      {account.used} utilisé{account.used > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {account.credits > 0 && (
                    <Button
                      size="sm"
                      onClick={() => navigate('/generer')}
                      className="bg-white text-navy-900 hover:bg-white/90 font-semibold shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Générer un ERP
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPacks(v => !v)}
                    className={`shrink-0 bg-transparent ${account.credits > 0
                      ? 'border-white/40 text-white hover:bg-white/10'
                      : 'border-gray-400 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                    Acheter des crédits
                  </Button>
                </div>
              </div>
            </div>

            {/* No credits CTA */}
            {account.credits === 0 && !showPacks && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-800">Vous n'avez plus de crédits</p>
                  <p className="text-xs text-amber-700">Achetez un pack pour continuer à générer des ERPs.</p>
                </div>
              </div>
            )}

            {/* Pack selector */}
            {showPacks && (
              <div className="bg-white border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm">Choisissez votre pack</h3>
                {packError && (
                  <p className="text-xs text-red-600">{packError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PACKS.map(pack => (
                    <button
                      key={pack.id}
                      onClick={() => handleBuyPack(pack.id)}
                      disabled={!!packLoading}
                      className={`relative border-2 rounded-xl p-4 text-left transition-all hover:border-navy-900 ${
                        pack.recommended ? 'border-navy-900' : 'border-gray-200'
                      }`}
                    >
                      {pack.recommended && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-navy-900 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          Meilleur rapport
                        </span>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{pack.label}</p>
                          <p className="text-xs text-gray-400">{pack.perUnit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-navy-900">{pack.price}</p>
                          <p className="text-[10px] text-gray-400">TTC</p>
                        </div>
                      </div>
                      {packLoading === pack.id && (
                        <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-navy-900" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 text-center">Paiement sécurisé par Stripe</p>
              </div>
            )}

            {/* ERP List */}
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-900">Mes ERPs</p>
                </div>
                {account.erps.length > 0 && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {account.erps.length}
                  </Badge>
                )}
              </div>

              {account.erps.length === 0 ? (
                <div className="px-5 py-10 text-center space-y-3">
                  <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Aucun ERP généré pour l'instant</p>
                  {account.credits > 0 && (
                    <Button
                      size="sm"
                      onClick={() => navigate('/generer')}
                      className="bg-navy-900 hover:bg-navy-800"
                    >
                      Générer mon premier ERP
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {account.erps.map(erp => (
                    <div key={erp.ref} className="px-5 py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{erp.adresse}</p>
                        <p className="text-xs text-gray-400">
                          {erp.date
                            ? new Date(erp.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                            : 'Date inconnue'}
                          {erp.commune ? ` · ${erp.commune}` : ''}
                        </p>
                      </div>
                      <a
                        href={`/apercu?ref=${encodeURIComponent(erp.ref)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline shrink-0"
                      >
                        Ouvrir <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate CTA if credits > 0 */}
            {account.credits > 0 && account.erps.length > 0 && (
              <button
                onClick={() => navigate('/generer')}
                className="w-full flex items-center justify-between bg-white border border-border rounded-xl px-5 py-4 hover:border-navy-900/30 hover:bg-navy-900/2 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-navy-900/8 rounded-lg w-9 h-9 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-navy-900" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Générer un nouvel ERP</p>
                    <p className="text-xs text-gray-400">{account.credits} crédit{account.credits > 1 ? 's' : ''} disponible{account.credits > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-navy-900 transition-colors" />
              </button>
            )}
          </>
        )}

      </div>
    </div>
  );
}
