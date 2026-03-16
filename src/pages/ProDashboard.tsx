import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Plus, ExternalLink, Loader2, AlertCircle, LogOut,
  CreditCard, Check, ChevronRight, FileText, Search, X,
  Receipt, ChevronDown, Clock, BarChart2, Building2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  getProSession, clearProSession,
  getProAccount, createProCheckoutByQty, updateProProfile,
} from '../services/pro.service';
import type { ProAccount } from '../services/pro.service';

// Tarification graduée — total toujours strictement croissant avec le volume
const GRAD_TIERS = [
  { from: 1,   to: 9,   rate: 7.0,  label: '1–9',     rateFmt: '7,00' },
  { from: 10,  to: 50,  rate: 3.0,  label: '10–50',   rateFmt: '3,00' },
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
  const [visibleErpCount, setVisibleErpCount] = useState(5);
  const [buyQty, setBuyQty] = useState(15);
  const [leadQty, setLeadQty] = useState(20);
  const [leadDept, setLeadDept] = useState('');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(
    () => new URLSearchParams(window.location.search).get('pack_success') === '1'
  );
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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
      setNomEntreprise(data.nom_entreprise ?? '');
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

  async function handleSaveProfile() {
    if (!session) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      await updateProProfile(session.token, nomEntreprise);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSavingProfile(false);
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

  const analytics = useMemo(() => {
    if (!account) return null;
    const totalBought = account.packs.reduce((s, p) => s + p.qty, 0);
    const totalSpentCents = account.packs.reduce((s, p) => s + (p.amount_ttc ?? 0), 0);
    const now = new Date();
    const months: { label: string; key: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      months.push({ label, key, count: 0 });
    }
    for (const erp of account.erps) {
      if (!erp.date) continue;
      const d = new Date(erp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const m = months.find(mo => mo.key === key);
      if (m) m.count++;
    }
    const maxCount = Math.max(...months.map(m => m.count), 1);
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = months.find(m => m.key === thisMonthKey)?.count ?? 0;
    return { totalBought, totalSpentCents, months, maxCount, thisMonth };
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
                    <span className={`text-xs font-semibold uppercase tracking-wider ${account.credits > 0 ? 'text-white' : 'text-gray-500'}`}>
                      Crédits disponibles
                    </span>
                  </div>
                  <p className={`text-3xl sm:text-4xl font-extrabold ${account.credits > 0 ? 'text-white' : 'text-gray-600'}`}>
                    {account.credits}
                    <span className={`text-base font-normal ml-2 ${account.credits > 0 ? 'text-white' : 'text-gray-400'}`}>
                      ERP{account.credits !== 1 ? 's' : ''}
                    </span>
                  </p>
                  {account.used > 0 && (
                    <p className={`text-xs ${account.credits > 0 ? 'text-white/70' : 'text-gray-400'}`}>
                      {account.used} utilisé{account.used > 1 ? 's' : ''}
                    </p>
                  )}
                  {account.credits > 0 && (
                    <p className="text-[10px] text-white/60 mt-1">Valables 12 mois à compter de chaque achat</p>
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
                    {/* Marqueurs de paliers — points de changement de taux */}
                    <div className="relative h-5 mt-1.5">
                      {[
                        { pct: 0,    label: '1' },
                        { pct: 1.8,  label: '10' },
                        { pct: 10.0, label: '51' },
                        { pct: 20.0, label: '101' },
                        { pct: 40.1, label: '201' },
                        { pct: 60.1, label: '301' },
                      ].map(({ pct, label }) => (
                        <div key={label} className="absolute flex flex-col items-center" style={{ left: `${pct}%` }}>
                          <div className="w-px h-1.5 bg-gray-300" />
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
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                      {GRAD_TIERS.map(t => {
                        const active = buyQty >= t.from;
                        const partial = active && buyQty < t.to;
                        const inTier = active ? Math.min(buyQty, t.to) - t.from + 1 : 0;
                        const contribution = inTier > 0 ? Math.round(inTier * t.rate) : 0;
                        return (
                          <div
                            key={t.from}
                            onClick={e => { e.stopPropagation(); setBuyQty(t.to); }}
                            className={`rounded px-1 py-1.5 text-center transition-colors cursor-pointer hover:opacity-80 ${partial ? 'bg-navy-900/15 border border-navy-900/20' : active ? 'bg-navy-900/8' : 'bg-gray-100'}`}
                          >
                            <p className={`text-[9px] font-bold leading-none ${active ? 'text-navy-900' : 'text-gray-300'}`}>{t.rateFmt}€</p>
                            <p className={`text-[7px] mt-1 leading-none ${active ? 'text-navy-900/60' : 'text-gray-300'}`}>
                              {active ? `${contribution} €` : t.label}
                            </p>
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
                  <p className="text-[10px] text-gray-400 text-center">Paiement sécurisé par Stripe · Facture automatique · Crédits valables 12 mois</p>
                </div>
              );
            })()}

            {/* Mon profil */}
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowProfile(v => !v)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-900">Mon profil</p>
                  {account.nom_entreprise && (
                    <span className="text-xs text-gray-400 truncate max-w-[160px]">{account.nom_entreprise}</span>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </button>
              {showProfile && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={nomEntreprise}
                      onChange={e => setNomEntreprise(e.target.value)}
                      placeholder="Ex : Dupont Diagnostic Immobilier"
                      maxLength={100}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900/30 bg-white placeholder:text-gray-400"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Apparaît en en-tête de chaque ERP généré à la place de "EDL & DIAGNOSTIC"</p>
                  </div>
                  {profileError && <p className="text-xs text-red-600">{profileError}</p>}
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 bg-navy-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-60"
                  >
                    {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : profileSaved ? <Check className="h-3.5 w-3.5" /> : null}
                    {profileSaved ? 'Enregistré !' : 'Enregistrer'}
                  </button>
                </div>
              )}
            </div>

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
                          {pack.expires_at && (
                            <p className="text-[10px] text-gray-400">
                              Expire le {new Date(pack.expires_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          )}
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

            {/* Analytics */}
            {analytics && account.packs.length > 0 && (
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAnalytics(v => !v)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Statistiques</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showAnalytics ? 'rotate-180' : ''}`} />
                </button>
                {showAnalytics && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl sm:text-2xl font-extrabold text-navy-900">{account.used}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">ERPs générés</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl sm:text-2xl font-extrabold text-navy-900">{analytics.thisMonth}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Ce mois-ci</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl sm:text-2xl font-extrabold text-navy-900">
                          {analytics.totalSpentCents > 0 ? `${Math.round(analytics.totalSpentCents / 100)} €` : '—'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Dépensé TTC</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Activité récente</p>
                      <div className="flex items-end gap-1.5 h-14">
                        {analytics.months.map(m => (
                          <div key={m.key} className="flex-1 flex flex-col items-center justify-end gap-1">
                            <div
                              className={`w-full rounded-sm transition-all ${m.count > 0 ? 'bg-navy-900/70' : 'bg-gray-100'}`}
                              style={{ height: m.count > 0 ? `${Math.max(Math.round((m.count / analytics.maxCount) * 40), 4)}px` : '2px' }}
                            />
                            <span className="text-[8px] text-gray-400 shrink-0">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
              ) : (() => {
                const displayed = searchQuery ? filteredErps : filteredErps.slice(0, visibleErpCount);
                const remaining = filteredErps.length - displayed.length;
                return (
                  <>
                    <div className="divide-y divide-gray-100">
                      {displayed.map(erp => {
                        const daysLeft = getDaysLeft(erp.validite);
                        const isExpired = daysLeft !== null && daysLeft <= 0;
                        const isNearExpiry = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
                        return (
                          <div key={erp.ref} className="px-5 py-3.5 flex items-center justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-gray-900 truncate">{erp.adresse}</p>
                                {isExpired && (
                                  <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">Expiré</span>
                                )}
                                {isNearExpiry && (
                                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">Expire dans {daysLeft} j</span>
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
                    {!searchQuery && remaining > 0 && (
                      <button
                        onClick={() => setVisibleErpCount(v => v + 5)}
                        className="w-full px-5 py-3 text-xs font-semibold text-navy-900 hover:bg-slate-50 border-t border-gray-100 transition-colors text-center"
                      >
                        Voir les {Math.min(remaining, 5)} suivants
                        <span className="text-gray-400 font-normal ml-1">({remaining} restants)</span>
                      </button>
                    )}
                  </>
                );
              })()}
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

          {/* Header — cliquable */}
          <button
            onClick={() => setShowMarketplace(v => !v)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Marketplace — Leads diagnostics</p>
                <p className="text-xs text-amber-600 font-medium">Lancement en cours · Réservez votre volume</p>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${showMarketplace ? 'rotate-180' : ''}`} />
          </button>

          {showMarketplace && <div className="border-t border-gray-100 px-5 py-5 space-y-5">
            <p className="text-xs text-gray-500 leading-relaxed">
              Recevez des demandes qualifiées dans votre secteur — particuliers vendeurs, agences, notaires. Indiquez votre volume et votre zone.
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

            {/* Département */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Département(s) d'intervention
              </label>
              <input
                type="text"
                value={leadDept}
                onChange={e => setLeadDept(e.target.value)}
                placeholder="Ex : 69 · Rhône, 01 · Ain, 38 · Isère"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900/30 bg-white placeholder:text-gray-400"
              />
            </div>

            {/* CTA réservation */}
            <a
              href={`mailto:pro@edletdiagnostic.fr?subject=R%C3%A9servation%20leads%20diagnostics%20%E2%80%94%20${leadQty}%20leads%2Fmois&body=Bonjour%2C%0A%0AJe%20souhaite%20r%C3%A9server%20${leadQty}%20leads%20par%20mois.%0A%0ACompte%20pro%20%3A%20${encodeURIComponent(session?.email ?? '')}%0AD%C3%A9partements%20%3A%20${encodeURIComponent(leadDept || 'non renseigné')}`}
              className="block w-full bg-navy-900 text-white text-sm font-semibold py-2.5 px-4 rounded-lg text-center hover:bg-navy-800 transition-colors"
            >
              Réserver {leadQty} leads / mois
            </a>

            <p className="text-[11px] text-gray-400 text-center">
              Sans engagement · Tarification sur devis · Réponse sous 24h
            </p>

          </div>}
        </div>
      </div>

      {/* Footer support */}
      <div className="max-w-2xl mx-auto px-4 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Un problème ?{' '}
          <a href="mailto:contact@edl-diagnostic-erp.fr" className="underline hover:text-gray-600">
            contact@edl-diagnostic-erp.fr
          </a>
          {' · '}
          <button onClick={() => { window.location.href = '/#hero'; }} className="underline hover:text-gray-600">
            Site grand public
          </button>
        </p>
      </div>

      {/* Success overlay — affiché après un achat Stripe réussi */}
      {showSuccessOverlay && !loading && account && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowSuccessOverlay(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-extrabold text-gray-900">Paiement confirmé !</p>
              {account.packs[0] && (
                <p className="text-3xl font-black text-navy-900">
                  +{account.packs[0].qty}
                  <span className="text-base font-normal text-gray-500 ml-1.5">
                    crédit{account.packs[0].qty > 1 ? 's' : ''} ERP
                  </span>
                </p>
              )}
              <p className="text-sm text-gray-500">Vos crédits sont disponibles immédiatement.</p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={() => { setShowSuccessOverlay(false); navigate('/generer'); }}
                className="w-full bg-navy-900 hover:bg-navy-800 font-bold"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Générer un ERP maintenant
              </Button>
              <button
                onClick={() => setShowSuccessOverlay(false)}
                className="text-sm text-gray-400 hover:text-gray-600 py-1"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
