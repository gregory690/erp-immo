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
  getProAccount, createProCheckoutByQty,
} from '../services/pro.service';
import type { ProAccount } from '../services/pro.service';

// Tarification graduée — total toujours strictement croissant avec le volume
const GRAD_TIERS = [
  { from: 1,   to: 50,  rate: 3.0,  label: '1–50',    rateFmt: '3,00' },
  { from: 51,  to: 100, rate: 2.5,  label: '51–100',  rateFmt: '2,50' },
  { from: 101, to: 200, rate: 2.0,  label: '101–200', rateFmt: '2,00' },
  { from: 201, to: 300, rate: 1.5,  label: '201–300', rateFmt: '1,50' },
  { from: 301, to: 500, rate: 1.0,  label: '301–500', rateFmt: '1,00' },
];

function calcTotal(qty: number): number {
  let total = 0;
  for (const t of GRAD_TIERS) {
    if (qty < t.from) break;
    total += (Math.min(qty, t.to) - t.from + 1) * t.rate;
  }
  return total;
}

const LEAD_TIERS = [
  { max: 10,  pricePerLead: 25 },
  { max: 30,  pricePerLead: 20 },
  { max: 100, pricePerLead: 15 },
  { max: 250, pricePerLead: 12 },
  { max: 500, pricePerLead: 10 },
];

function getLeadPricing(qty: number) {
  const tier = LEAD_TIERS.find(t => qty <= t.max) ?? LEAD_TIERS[LEAD_TIERS.length - 1];
  return { pricePerLead: tier.pricePerLead, totalHT: qty * tier.pricePerLead };
}

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
  const [buyQty, setBuyQty] = useState(15);
  const [leadQty, setLeadQty] = useState(20);
  const [leadContactQty, setLeadContactQty] = useState(501);

  const packSuccess = new URLSearchParams(window.location.search).get('pack_success') === '1';

  useEffect(() => {
    if (!session) {
      navigate('/pro/login', { replace: true });
      return;
    }
    loadAccount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset packLoading si le navigateur restaure la page depuis le bfcache
  // (retour arrière après redirection vers Stripe)
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) setPackLoading(null);
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
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

  async function handleBuyQty() {
    if (!session) return;
    setPackError(null);
    setPackLoading('buy');
    try {
      const { url } = await createProCheckoutByQty(buyQty, session.token);
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
                      ? 'border-white/40 text-white hover:bg-white/10 hover:text-white'
                      : 'border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-600'
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

            {/* Pack selector — slider */}
            {showPacks && (() => {
              const totalHT = Math.round(calcTotal(buyQty));
              const totalTTC = Math.round(totalHT * 1.2);
              const avgDisplay = (calcTotal(buyQty) / buyQty).toFixed(2).replace('.', ',');
              return (
                <div className="bg-white border border-border rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900 text-sm">Combien d'ERPs voulez-vous acheter ?</h3>
                  {packError && <p className="text-xs text-red-600">{packError}</p>}

                  {/* Slider */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-xs text-gray-500">Volume</p>
                      <p className="text-navy-900 font-extrabold text-2xl">{buyQty} ERPs</p>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={500}
                      value={buyQty}
                      onChange={e => setBuyQty(Number(e.target.value))}
                      className="w-full cursor-pointer accent-navy-900"
                    />
                    {/* Marqueurs de paliers */}
                    <div className="relative h-7 mt-1.5">
                      {[
                        { pct: 0,    price: '3€',    label: '1' },
                        { pct: 9.8,  price: '2,5€',  label: '51' },
                        { pct: 19.8, price: '2€',    label: '101' },
                        { pct: 39.9, price: '1,5€',  label: '201' },
                        { pct: 59.9, price: '1€',    label: '301' },
                      ].map(({ pct, price, label }) => (
                        <div key={label} className="absolute flex flex-col items-center" style={{ left: `${pct}%` }}>
                          <div className="w-px h-1.5 bg-gray-300" />
                          <span className="text-[8px] text-navy-900/70 font-semibold mt-0.5 whitespace-nowrap">{price}</span>
                          <span className="text-[7px] text-gray-400 mt-0.5 whitespace-nowrap">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Résultat */}
                  <div className="bg-slate-50 rounded-xl px-5 py-4 space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-extrabold text-navy-900">{avgDisplay} €</p>
                        <p className="text-xs text-gray-500 mt-0.5">HT / ERP en moyenne</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{totalHT} € HT</p>
                        <p className="text-xs text-gray-400 mt-0.5">{totalTTC} € TTC</p>
                      </div>
                    </div>
                    {/* Détail des tranches */}
                    <div className="grid grid-cols-5 gap-1">
                      {GRAD_TIERS.map(t => {
                        const active = buyQty >= t.from;
                        const partial = active && buyQty < t.to;
                        return (
                          <div
                            key={t.from}
                            onClick={e => { e.stopPropagation(); setBuyQty(t.from); }}
                            className={`rounded px-1 py-1.5 text-center transition-colors cursor-pointer hover:opacity-80 ${partial ? 'bg-navy-900/15 border border-navy-900/20' : active ? 'bg-navy-900/8' : 'bg-gray-100'}`}
                          >
                            <p className={`text-[9px] font-bold leading-none ${active ? 'text-navy-900' : 'text-gray-300'}`}>{t.rateFmt}€</p>
                            <p className={`text-[7px] mt-1 leading-none ${active ? 'text-gray-500' : 'text-gray-300'}`}>{t.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bouton achat */}
                  <button
                    onClick={handleBuyQty}
                    disabled={!!packLoading}
                    className="w-full bg-navy-900 text-white font-bold py-2.5 rounded-lg hover:bg-navy-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {packLoading === 'buy'
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : `Acheter ${buyQty} ERPs — ${totalHT} € HT`
                    }
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">Paiement sécurisé par Stripe · Facture automatique</p>
                </div>
              );
            })()}

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
                          href={pack.invoice_url || `/pro/facture?id=${encodeURIComponent(pack.stripe_id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline shrink-0"
                        >
                          {pack.invoice_url ? 'Facture' : 'Reçu'} <ExternalLink className="h-3 w-3" />
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

      {/* Marketplace leads — configurateur */}
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <div className="bg-white border border-border rounded-xl overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Marketplace — Leads diagnostics</p>
              <p className="text-xs text-amber-600 font-medium">Lancement en cours · Réservez votre volume</p>
            </div>
          </div>

          <div className="px-5 py-5 space-y-5">
            <p className="text-xs text-gray-500 leading-relaxed">
              Recevez des demandes qualifiées dans votre secteur — particuliers vendeurs, agences, notaires. Sélectionnez votre volume mensuel.
            </p>

            {/* Slider leads */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-sm font-medium text-gray-700">Leads souhaités / mois</p>
                <p className="text-navy-900 font-extrabold text-2xl">{leadQty}</p>
              </div>
              <input
                type="range"
                min={1}
                max={500}
                value={leadQty}
                onChange={e => setLeadQty(Number(e.target.value))}
                className="w-full cursor-pointer accent-navy-900"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>1 lead</span>
                <span>500 leads</span>
              </div>
            </div>

            {/* Résultat pricing */}
            {(() => {
              const { pricePerLead, totalHT } = getLeadPricing(leadQty);
              return (
                <div className="bg-slate-50 rounded-xl px-5 py-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-navy-900">{pricePerLead} €</p>
                    <p className="text-xs text-gray-500 mt-0.5">HT / lead</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{totalHT} € HT</p>
                    <p className="text-xs text-gray-400 mt-0.5">{Math.round(totalHT * 1.2)} € TTC / mois</p>
                  </div>
                </div>
              );
            })()}

            {/* CTA réservation */}
            <a
              href={`mailto:pro@edletdiagnostic.fr?subject=R%C3%A9servation%20leads%20diagnostics%20%E2%80%94%20${leadQty}%20leads%2Fmois&body=Bonjour%2C%0A%0AJe%20souhaite%20r%C3%A9server%20${leadQty}%20leads%20par%20mois.%0A%0ACompte%20pro%20%3A%20${encodeURIComponent(session?.email ?? '')}%0ATarif%20estim%C3%A9%20%3A%20${getLeadPricing(leadQty).totalHT}%20%E2%82%AC%20HT%2Fmois`}
              className="block w-full bg-navy-900 text-white text-sm font-semibold py-2.5 px-4 rounded-lg text-center hover:bg-navy-800 transition-colors"
            >
              Réserver {leadQty} leads / mois
            </a>

            {/* Contact > 500 */}
            <div className="border border-gray-200 rounded-xl px-4 py-4 space-y-3">
              <p className="text-xs font-semibold text-gray-700">Besoin de plus de 500 leads / mois ?</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={501}
                  value={leadContactQty}
                  onChange={e => setLeadContactQty(Number(e.target.value))}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  placeholder="Volume"
                />
                <span className="text-xs text-gray-400">leads / mois</span>
                <a
                  href={`mailto:pro@edletdiagnostic.fr?subject=Offre%20sur%20mesure%20leads%20%E2%80%94%20${leadContactQty}%20leads%2Fmois&body=Bonjour%2C%0A%0AJe%20suis%20int%C3%A9ress%C3%A9%20par%20un%20volume%20de%20${leadContactQty}%20leads%2Fmois.%0A%0ACompte%20pro%20%3A%20${encodeURIComponent(session?.email ?? '')}`}
                  className="ml-auto text-xs font-semibold text-navy-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Contacter l'équipe →
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
