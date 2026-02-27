import { useState } from 'react';
import { Search, ExternalLink, Lock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

interface ERPResult {
  ref: string;
  adresse: string;
  commune: string;
  date: string | null;
  paid: boolean;
  email: string | null;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [email, setEmail] = useState('');
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ERPResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email && !ref) return;
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, email: email || undefined, ref: ref || undefined }),
      });

      if (res.status === 401) {
        setAuthenticated(false);
        setAuthError('Mot de passe incorrect.');
        return;
      }
      if (!res.ok) throw new Error('Erreur serveur');

      const data = await res.json() as { erps: ERPResult[] };
      setResults(data.erps);
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 4) {
      setAuthError('Mot de passe trop court.');
      return;
    }
    setAuthError('');
    setAuthenticated(true);
  }

  // ─── Écran de connexion ───────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-border rounded-xl p-8 w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-navy-900/5 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5 text-navy-900" />
            </div>
            <h1 className="font-bold text-gray-900">Accès admin</h1>
            <p className="text-xs text-gray-400">EDL&amp;DIAGNOSTIC — usage interne uniquement</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="password"
              required
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              autoFocus
            />
            <Button type="submit" className="w-full bg-navy-900 hover:bg-navy-800">
              Accéder
            </Button>
          </form>

          {authError && (
            <p className="text-xs text-red-600 text-center">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  // ─── Interface de recherche ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-navy-900">EDL&amp;DIAGNOSTIC · Admin</span>
          <button
            onClick={() => { setAuthenticated(false); setPassword(''); setResults(null); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Formulaire de recherche */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Rechercher un ERP client</h2>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Par email du client</label>
              <input
                type="email"
                placeholder="client@exemple.fr"
                value={email}
                onChange={e => { setEmail(e.target.value); setRef(''); }}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Par référence ERP</label>
              <input
                type="text"
                placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx"
                value={ref}
                onChange={e => { setRef(e.target.value); setEmail(''); }}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || (!email && !ref)}
              className="w-full bg-navy-900 hover:bg-navy-800"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Recherche…</>
                : <><Search className="h-4 w-4 mr-2" />Rechercher</>
              }
            </Button>
          </form>

          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
        </div>

        {/* Résultats */}
        {results !== null && (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                {results.length === 0
                  ? 'Aucun ERP trouvé'
                  : `${results.length} ERP${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`}
              </p>
            </div>

            {results.length > 0 && (
              <div className="divide-y divide-gray-100">
                {results.map(erp => (
                  <div key={erp.ref} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{erp.adresse}</p>
                      <p className="text-xs text-gray-400">
                        {erp.date
                          ? new Date(erp.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                          : 'Date inconnue'}
                        {erp.email ? ` · ${erp.email}` : ''}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {erp.paid
                          ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /><span className="text-xs text-green-700 font-medium">Payé</span></>
                          : <><XCircle className="h-3.5 w-3.5 text-red-500" /><span className="text-xs text-red-600 font-medium">Non payé</span></>
                        }
                      </div>
                      <p className="text-[10px] text-gray-300 font-mono">{erp.ref}</p>
                    </div>
                    <a
                      href={`/apercu?ref=${encodeURIComponent(erp.ref)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:underline shrink-0 mt-0.5"
                    >
                      Ouvrir <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
