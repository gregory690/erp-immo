import { useNavigate } from 'react-router-dom';
import { Check, FileText, Zap, Shield, ArrowRight, Building2, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getProSession } from '../services/pro.service';

const PACK_10_FEATURES = [
  '10 ERPs valides 6 mois chacun',
  'Données officielles Géorisques',
  'PDF téléchargeable immédiatement',
  'Accès à votre espace pro',
  'Historique de vos ERPs',
  'Conformité arrêté 27/09/2022',
];

const PACK_30_FEATURES = [
  '30 ERPs valides 6 mois chacun',
  'Tout le Pack 10 +',
  'Tarif préférentiel par ERP',
  'Idéal usage régulier',
];

export default function ProLanding() {
  const navigate = useNavigate();
  const session = getProSession();

  function handleCTA() {
    if (session) {
      navigate('/pro/dashboard');
    } else {
      navigate('/pro/login');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="font-bold text-navy-900 text-sm hover:opacity-80 transition-opacity"
          >
            EDL&amp;DIAGNOSTIC
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCTA}
            className="text-navy-900 border-navy-900/20 hover:bg-navy-900/5"
          >
            {session ? 'Mon espace' : 'Se connecter'}
          </Button>
        </div>
      </header>

      {/* Hero — navy background, packs in spotlight */}
      <section className="bg-navy-900 px-4 pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="max-w-3xl mx-auto relative space-y-8">

          {/* Title */}
          <div className="text-center space-y-3">
            <Badge className="bg-white/15 text-white border-white/20 text-xs px-3 py-1">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Espace professionnel
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              L'ERP en volume,<br className="hidden sm:block" /> à votre rythme
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto">
              Achetez des crédits une fois, générez vos ERPs quand vous voulez depuis votre espace dédié.
            </p>
          </div>

          {/* Pack cards — hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">

            {/* Pack 10 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-5">
              <div>
                <p className="font-bold text-white text-lg">Pack 10 ERPs</p>
                {/* Prix — fort blur */}
                <div className="relative mt-2 w-fit">
                  <div className="flex items-baseline gap-1.5 blur-md select-none pointer-events-none">
                    <span className="text-5xl font-extrabold text-white">99,99 €</span>
                    <span className="text-sm text-white/60 font-medium">TTC</span>
                  </div>
                  <button
                    onClick={handleCTA}
                    className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Voir le tarif
                  </button>
                </div>
              </div>
              <ul className="space-y-2">
                {PACK_10_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                className="w-full bg-white text-navy-900 hover:bg-white/90 font-semibold"
              >
                Commencer avec ce pack
              </Button>
            </div>

            {/* Pack 30 — recommended */}
            <div className="bg-amber-400 rounded-2xl p-6 space-y-5 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-navy-900 text-white border-navy-800 text-xs px-3 font-semibold whitespace-nowrap">
                  Meilleur rapport qualité/prix
                </Badge>
              </div>
              <div>
                <p className="font-bold text-navy-900 text-lg">Pack 30 ERPs</p>
                {/* Prix — fort blur */}
                <div className="relative mt-2 w-fit">
                  <div className="flex items-baseline gap-1.5 blur-md select-none pointer-events-none">
                    <span className="text-5xl font-extrabold text-navy-900">199,99 €</span>
                    <span className="text-sm text-navy-900/60 font-medium">TTC</span>
                  </div>
                  <button
                    onClick={handleCTA}
                    className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-navy-900 hover:opacity-70 transition-opacity"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Voir le tarif
                  </button>
                </div>
              </div>
              <ul className="space-y-2">
                {PACK_30_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/80">
                    <Check className="h-4 w-4 text-navy-900 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                className="w-full bg-navy-900 text-white hover:bg-navy-800 font-semibold"
              >
                Choisir le Pack 30
              </Button>
            </div>

          </div>

          {/* CTA principal */}
          <div className="text-center space-y-2">
            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-white text-navy-900 hover:bg-white/90 font-bold h-12 px-10 text-base shadow-lg"
            >
              {session ? 'Accéder à mon espace' : "Accéder à l'espace pro"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-white/40 text-xs">Connexion par lien email · sans mot de passe</p>
          </div>

        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-12">

        {/* Value props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: 'Prêt en 2 minutes', desc: 'Saisie adresse → calcul des risques → PDF prêt à annexer' },
            { icon: Shield, title: 'Données officielles', desc: 'API Géorisques du gouvernement, conformité arrêté 27/09/2022' },
            { icon: FileText, title: 'Historique complet', desc: 'Retrouvez tous vos ERPs passés depuis votre espace pro' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-border rounded-xl p-5 space-y-2">
              <div className="bg-navy-900/8 rounded-lg w-10 h-10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-navy-900" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-lg font-bold text-navy-900 mb-5">Questions fréquentes</h2>
          {[
            {
              q: 'Les crédits expirent-ils ?',
              a: "Non. Vos crédits sont valables sans limite de temps. C'est l'ERP généré qui a une validité de 6 mois.",
            },
            {
              q: 'Puis-je retrouver un ERP généré il y a plusieurs semaines ?',
              a: "Oui. Votre espace pro conserve l'historique de tous vos ERPs (jusqu'à 100) pendant 6 mois.",
            },
            {
              q: 'Comment me connecter ?',
              a: 'Par lien email : on vous envoie un lien de connexion instantané, pas besoin de mot de passe. La session dure 24h.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-border rounded-xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-1">{q}</p>
              <p className="text-sm text-gray-500">{a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
