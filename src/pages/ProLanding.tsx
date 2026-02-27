import { useNavigate } from 'react-router-dom';
import { Check, FileText, Zap, Shield, ArrowRight, Building2 } from 'lucide-react';
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
  'Tarif préférentiel (6,67 €/ERP)',
  'Idéal cabinet multi-mandats',
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

      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 space-y-16">

        {/* Hero */}
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          <Badge className="bg-navy-900/10 text-navy-900 border-navy-900/20 text-xs px-3 py-1">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Usage professionnel
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 leading-tight tracking-tight">
            L'ERP en ligne pour les<br className="hidden sm:block" /> diagnostiqueurs immobiliers
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Générez vos États des Risques et Pollutions en moins de 2 minutes.
            Achetez des crédits en volume et gérez tous vos ERPs depuis un espace dédié.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-navy-900 hover:bg-navy-800 text-base font-semibold h-12 px-8"
            >
              {session ? 'Accéder à mon espace' : 'Accéder à l\'espace pro'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/generer')}
              className="text-gray-700 text-base h-12 px-8"
            >
              Essayer pour 19,99 €
            </Button>
          </div>
        </div>

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

        {/* Pricing */}
        <div>
          <h2 className="text-xl font-bold text-navy-900 text-center mb-8">Choisissez votre pack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Pack 10 */}
            <div className="bg-white border-2 border-border rounded-xl p-6 space-y-5 relative">
              <div>
                <p className="font-bold text-navy-900 text-lg">Pack 10 ERPs</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-4xl font-extrabold text-navy-900">100 €</span>
                  <span className="text-sm text-gray-500 font-medium">TTC</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">soit 10 € / ERP</p>
              </div>
              <ul className="space-y-2">
                {PACK_10_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                variant="outline"
                className="w-full border-navy-900/30 text-navy-900 hover:bg-navy-900/5"
              >
                Commencer avec ce pack
              </Button>
            </div>

            {/* Pack 30 — recommended */}
            <div className="bg-navy-900 rounded-xl p-6 space-y-5 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-amber-400 text-amber-900 border-amber-300 text-xs px-3 font-semibold whitespace-nowrap">
                  Meilleur rapport qualité/prix
                </Badge>
              </div>
              <div>
                <p className="font-bold text-white text-lg">Pack 30 ERPs</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-4xl font-extrabold text-white">200 €</span>
                  <span className="text-sm text-white/60 font-medium">TTC</span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">soit 6,67 € / ERP · économisez 100 €</p>
              </div>
              <ul className="space-y-2">
                {PACK_30_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                className="w-full bg-white text-navy-900 hover:bg-white/90 font-semibold"
              >
                Choisir le Pack 30
              </Button>
            </div>

          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Paiement sécurisé par Stripe · Facturation disponible sur demande
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-lg font-bold text-navy-900 mb-5">Questions fréquentes</h2>
          {[
            {
              q: 'Les crédits expirent-ils ?',
              a: 'Non. Vos crédits sont valables sans limite de temps. C\'est l\'ERP généré qui a une validité de 6 mois.'
            },
            {
              q: 'Puis-je retrouver un ERP généré il y a plusieurs semaines ?',
              a: 'Oui. Votre espace pro conserve l\'historique de tous vos ERPs (jusqu\'à 100) pendant 6 mois.'
            },
            {
              q: 'Comment me connecter ?',
              a: 'Par magic link : on vous envoie un lien par email, pas besoin de mot de passe. La session dure 24h.'
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
