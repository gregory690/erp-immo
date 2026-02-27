import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { proLogin, getProSession } from '../services/pro.service';

export default function ProLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si déjà connecté, rediriger directement
  if (getProSession()) {
    navigate('/pro/dashboard', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);
    try {
      await proLogin(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du lien');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => navigate('/pro')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Espace Pro
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">

          {!sent ? (
            <>
              <div className="text-center space-y-2">
                <div className="bg-navy-900/5 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-navy-900" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Connexion à l'espace pro</h1>
                <p className="text-sm text-gray-500">
                  Saisissez votre email professionnel.<br />
                  Nous vous enverrons un lien de connexion instantané.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="votre@email.pro"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  autoFocus
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-navy-900 hover:bg-navy-800 font-semibold h-11"
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi en cours…</>
                    : 'Recevoir mon lien de connexion'
                  }
                </Button>
              </form>

              {error && (
                <p className="text-xs text-red-600 text-center">{error}</p>
              )}

              <p className="text-xs text-gray-400 text-center">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => navigate('/pro')}
                  className="underline hover:text-gray-600"
                >
                  Découvrir l'offre pro
                </button>
              </p>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-gray-900">Vérifiez votre boîte mail</h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Un lien de connexion a été envoyé à{' '}
                  <span className="font-semibold text-gray-700">{email}</span>.
                  <br />Il est valable pendant <strong>1 heure</strong>.
                </p>
              </div>
              <div className="bg-slate-50 border border-border rounded-xl p-4 text-xs text-gray-500 text-left space-y-1">
                <p className="font-medium text-gray-700">Vous ne le recevez pas ?</p>
                <p>· Vérifiez vos spams</p>
                <p>· Le lien arrive généralement en moins d'une minute</p>
                <p>
                  ·{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="underline hover:text-gray-700"
                  >
                    Réessayer avec un autre email
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
