import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Plus, ExternalLink, Loader2, AlertCircle, LogOut,
  CreditCard, Check, ChevronRight, FileText, Search, X,
  Receipt, ChevronDown, Clock,
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

function formatDate(d: string | null): string {
  if (!d) return 'Date inconnue';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatAmount(amount_ttc: number | null): string {
  if (amount_ttc == null) return '—';
  return (amount_ttc / 100).toFixed(2).replace('.', ',') + ' €';
}

function getDaysLeft(validite: string | null): number | null {
  if (!validite) return null;
  return Math.ceil((new Date(validite).getTime() - Date.now()) / 86400000);
}

export default function ProDashboard() {
  const navigate = useNavigate();
  const session = getProSession();

  const [account, setAccount] = useState<ProAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packLoading, setPackLoading] = useState<string | null>(null);
  const [packError, setPackError] = useState<string | null>(null);
  const [showPacks, setShowPacks] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredErps = useMemo(() => {
    if (!account) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return account.erps;
    return account.erps.filter(e =>
      e.adresse.toLowerCase().includes(q) || e.commune.toLowerCase().includes(q)
    );
  }, [account, searchQuery]);

  const nearExpiryCount = useMemo(() => {
    if (!account) return 0;
    return account.erps.filter(e => {
      const d = getDaysLeft(e.validite);
      return d !== null && d > 0 && d <= 30;
    }).length;
  }, [account]);

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
            {/* Near-expiry warning banner */}
            {nearExpiryCount > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {nearExpiryCount} ERP{nearExpiryCount > 1 ? 's expirent' : ' expire'} dans moins de 30 jours
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Pensez à les renouveler avant leur date d'expiration.
                  </p>
                </div>
              </div>
            )}

            {/* Credits banner */}
            <div className={`rounded-xl p-5 sm:p-6 ${account.credits > 0 ? 'bg-navy-900' : 'bg-slate-200'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-5 w-5 ${account.credits > 0 ? 'text-amber-400' : 'text-gray-500'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${account.credits > 0 ? 'text-white/60' : 'text-gray-500'}`}>
                      Crédits disponibles
                    </span>
                  </div>
                  <p className={`text-3xl sm:text-4xl font-extrabold ${account.credits > 0 ? 'text-white' : 'text-gray-600'}`}>
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

            {/* Mes achats */}
            {account.packs.length > 0 && (
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowPurchases(v => !v)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Mes achats</p>
                    <Badge variant="outline" className="text-xs text-gray-500">{account.packs.length}</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showPurchases ? 'rotate-180' : ''}`} />
                </button>

                {showPurchases && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {account.packs.map((pack, i) => (
                      <div key={pack.stripe_id || i} className="px-5 py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium text-gray-900">
                            Pack {pack.qty} ERP{pack.qty > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(pack.date)} · {formatAmount(pack.amount_ttc)} TTC
                          </p>
                        </div>
                        <a
                          href={`/pro/facture?id=${encodeURIComponent(pack.stripe_id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline shrink-0"
                        >
                          Reçu <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ERP List */}
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Mes ERPs</p>
                  </div>
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {searchQuery ? `${filteredErps.length} / ${account.erps.length}` : account.erps.length}
                  </Badge>
                </div>

                {/* Search */}
                {account.erps.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par adresse ou commune…"
                      className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900/40 placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
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
              ) : filteredErps.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-gray-500">Aucun ERP trouvé pour « {searchQuery} »</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs text-navy-900 underline mt-1">
                    Effacer la recherche
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredErps.map(erp => {
                    const daysLeft = getDaysLeft(erp.validite);
                    const isExpired = daysLeft !== null && daysLeft <= 0;
                    const isNearExpiry = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

                    return (
                      <div key={erp.ref} className="px-5 py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-900 truncate">{erp.adresse}</p>
                            {isExpired && (
                              <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                                Expiré
                              </span>
                            )}
                            {isNearExpiry && (
                              <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                                Expire dans {daysLeft} j
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatDate(erp.date)}
                            {erp.commune ? ` · ${erp.commune}` : ''}
                            {erp.validite && !isExpired && !isNearExpiry && (
                              <span className="text-gray-300"> · valide jusqu'au {new Date(erp.validite).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                            )}
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
                    );
                  })}
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
