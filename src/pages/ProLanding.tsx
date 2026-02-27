import { useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, Building2,
  Clock, Euro, LayoutDashboard, RefreshCw, BadgeCheck, HeartHandshake,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getProSession } from '../services/pro.service';

const PACK_10_FEATURES = [
  '10 ERPs valides 6 mois chacun',
  'Données officielles Géorisques',
  'PDF téléchargeable immédiatement',
  'Espace pro dédié inclus',
  'Historique de vos ERPs',
  'Conformité arrêté 27/09/2022',
];

const PACK_50_FEATURES = [
  '50 ERPs valides 6 mois chacun',
  'Tout le Pack 10 inclus',
  'Tarif préférentiel par ERP',
  'Idéal pour un usage régulier',
  'Crédits sans expiration',
];

const BENEFITS = [
  {
    icon: Euro,
    title: 'Économisez à chaque ERP',
    desc: 'Le tarif unitaire diminue avec le volume. Moins vous payez par ERP, plus votre marge est préservée — ou répercutée en avantage client.',
  },
  {
    icon: Clock,
    title: 'Prêt en moins de 2 minutes',
    desc: "Saisissez l'adresse, confirmez la position, récupérez le PDF. Aucune attente, aucun aller-retour. Parfait entre deux rendez-vous.",
  },
  {
    icon: LayoutDashboard,
    title: 'Tableau de bord centralisé',
    desc: 'Tous vos ERPs au même endroit. Retrouvez, re-téléchargez ou transmettez n\'importe quel document en quelques secondes.',
  },
  {
    icon: RefreshCw,
    title: 'Crédits sans expiration',
    desc: 'Achetez quand ça vous arrange. Vos crédits restent disponibles sans limite de temps — utilisez-les à votre rythme.',
  },
  {
    icon: BadgeCheck,
    title: 'Documents légalement conformes',
    desc: "Données issues des APIs officielles de l'État (Géorisques, BRGM, IGN). Accepté par les notaires, agences et bailleurs.",
  },
  {
    icon: HeartHandshake,
    title: 'Support dédié',
    desc: 'Un doute sur un document ? Une question sur une réglementation ? Notre équipe vous répond par email sous 24h.',
  },
];

const REVIEWS = [
  {
    name: 'Sophie M.',
    role: 'Diagnostiqueure immobilière — Lyon',
    text: "Je génère en moyenne 15 ERPs par mois. Avec le pack pro, j'ai réduit mon coût unitaire de moitié et je retrouve tous mes documents en un clic depuis le dashboard. Indispensable.",
    rating: 5,
  },
  {
    name: 'Thierry B.',
    role: 'Agent immobilier indépendant — Bordeaux',
    text: "Ce qui m'a convaincu, c'est la conformité : données Géorisques officielles, arrêté 2022 respecté. Mes notaires l'acceptent sans discussion. Et le PDF est prêt en 2 minutes chrono.",
    rating: 5,
  },
  {
    name: 'Camille R.',
    role: 'Gestionnaire de patrimoine — Paris',
    text: "J'avais besoin d'une facturation mensuelle pour mon cabinet. L'équipe a été réactive, on a trouvé une formule adaptée. Le support dédié fait vraiment la différence.",
    rating: 5,
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Créez votre espace',
    desc: 'Entrez votre email, recevez un lien de connexion instantané. Aucun mot de passe, aucun formulaire interminable.',
  },
  {
    num: '02',
    title: 'Choisissez votre pack',
    desc: 'Sélectionnez le volume qui correspond à votre activité. Paiement sécurisé par Stripe, facture disponible.',
  },
  {
    num: '03',
    title: 'Générez à la demande',
    desc: 'Depuis votre dashboard, lancez un ERP en 2 minutes. Le PDF est prêt avant même votre prochain rendez-vous.',
  },
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-70 transition-opacity"
          >
            <img src="/logo-edl.svg" alt="EDL&DIAGNOSTIC" className="h-9 w-auto" />
          </button>
          <Button
            size="sm"
            onClick={handleCTA}
            className="bg-navy-900 hover:bg-navy-800 text-white"
          >
            {session ? 'Mon espace' : 'Accéder à l\'espace pro'}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* Hero — navy, packs en avant-scène */}
      <section className="bg-navy-900 px-4 pt-14 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="max-w-3xl mx-auto relative space-y-8">

          {/* Eyebrow + titre */}
          <div className="text-center space-y-4">
            <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs px-3 py-1 font-semibold">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Espace partenaire EDL&amp;DIAGNOSTIC
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
              L'ERP professionnel,<br className="hidden sm:block" />
              <span className="text-amber-400"> sans contrainte</span>
            </h1>
            <p className="text-white/65 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Crédits en volume, espace dédié, historique complet.
              Concentrez-vous sur vos clients — on s'occupe de la conformité.
            </p>
          </div>

          {/* Pack cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch mt-6">

            {/* Pack 10 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 shadow-xl shadow-black/25">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Découverte</p>
              <p className="font-bold text-navy-900 text-lg mt-1">Pack 10 ERPs</p>
              <div className="flex items-baseline gap-1.5 mt-3 mb-1">
                <span className="text-4xl font-extrabold text-navy-900">99,99 €</span>
                <span className="text-sm text-gray-400 font-medium">TTC</span>
              </div>
              <p className="text-xs text-gray-400 mb-5">soit 10 € / ERP</p>
              <ul className="space-y-2.5 flex-1">
                {PACK_10_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                className="w-full mt-6 bg-navy-900 text-white hover:bg-navy-800 font-semibold"
              >
                Commencer
              </Button>
            </div>

            {/* Pack 50 — recommandé */}
            <div className="flex flex-col bg-amber-400 rounded-2xl px-6 pt-10 pb-6 shadow-2xl shadow-amber-900/40 ring-2 ring-amber-300 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                  <span className="animate-bounce inline-block">🔥</span>
                  Notre recommandation
                </span>
              </div>
              <p className="text-xs font-semibold text-navy-900/50 uppercase tracking-widest">Professionnel</p>
              <p className="font-bold text-navy-900 text-lg mt-1">Pack 50 ERPs</p>
              <div className="flex items-baseline gap-1.5 mt-3 mb-1">
                <span className="text-4xl font-extrabold text-navy-900">249,99 €</span>
                <span className="text-sm text-navy-900/50 font-medium">TTC</span>
              </div>
              <p className="text-xs text-navy-900/60 font-medium mb-5">soit 5 € / ERP — 50% d'économie</p>
              <ul className="space-y-2.5 flex-1">
                {PACK_50_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/85">
                    <Check className="h-4 w-4 text-navy-900/70 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                className="w-full mt-6 bg-navy-900 text-white hover:bg-navy-800 font-bold"
              >
                Choisir ce pack
              </Button>
            </div>

            {/* Sur mesure */}
            <div className="flex flex-col bg-white/8 border border-white/20 rounded-2xl p-6 shadow-xl shadow-black/20">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Sur mesure</p>
              <p className="font-bold text-white text-lg mt-1">Volume & Agences</p>
              <p className="text-white/55 text-sm mt-3 mb-5 leading-relaxed">
                Vous traitez plus de 50 ERPs/mois ou souhaitez une intégration sur-mesure ?
              </p>
              <ul className="space-y-2.5 flex-1">
                {[
                  'Tarif négocié selon volume',
                  'Facturation mensuelle possible',
                  'Intégration API sur demande',
                  'Gestionnaire de compte dédié',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <Check className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => { window.location.href = 'mailto:pro@edletdiagnostic.fr?subject=Offre%20sur%20mesure%20ERP'; }}
                variant="outline"
                className="w-full mt-6 border-white/30 text-white hover:bg-white/10 font-semibold"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>

          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <div className="bg-white rounded-full h-6 w-6 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                <img src="/marianne.png" alt="Marianne RF" className="h-full w-full object-contain" />
              </div>
              <span className="text-[11px] font-semibold text-white/80 uppercase tracking-widest">
                Données officielles · APIs de l'État
              </span>
            </div>
            <p className="text-white/30 text-xs">Paiement sécurisé Stripe · Connexion par lien email, sans mot de passe</p>
          </div>

        </div>
      </section>

      {/* Avantages partenaire */}
      <section className="px-4 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">Pourquoi rejoindre l'espace pro</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Tout ce que vous gagnez en tant que partenaire</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-navy-900 rounded-xl w-10 h-10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-bold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">Simple et rapide</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Opérationnel en 3 étapes</h2>
          </div>
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.num} className="flex gap-5 items-start">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center">
                  <span className="text-white font-black text-sm">{step.num}</span>
                </div>
                <div className="flex-1 pt-1 pb-5 border-b border-gray-100 last:border-0">
                  <p className="font-bold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparaison B2C vs Pro */}
      <section className="px-4 py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">Offre adaptée à votre usage</p>
            <h2 className="text-2xl font-extrabold text-navy-900">Ponctuel ou régulier — il y a une formule pour vous</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ponctuel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <p className="font-bold text-gray-900">Usage ponctuel</p>
              <p className="text-sm text-gray-500">Vous avez besoin d'un ERP de temps en temps — pour votre propre bien ou un client occasionnel.</p>
              <ul className="space-y-2">
                {['Paiement à l\'acte', 'Disponible 24h/24', 'Aucun engagement'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-gray-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={() => navigate('/generer')}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Générer un ERP à l'unité
              </Button>
            </div>
            {/* Pro */}
            <div className="bg-navy-900 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white">Espace Pro</p>
                <Badge className="bg-amber-400 text-amber-900 border-amber-300 text-xs font-semibold">Recommandé</Badge>
              </div>
              <p className="text-sm text-white/65">Vous gérez plusieurs biens ou accompagnez des clients régulièrement. Le volume vous permet d'optimiser vos coûts.</p>
              <ul className="space-y-2">
                {['Tarif dégressif par volume', 'Dashboard & historique', 'Crédits sans expiration', 'Support dédié'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                className="w-full bg-amber-400 text-navy-900 hover:bg-amber-300 font-semibold"
              >
                Accéder à l'espace pro
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Avis partenaires */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">Ils nous font confiance</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Ce que disent nos partenaires pro</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {REVIEWS.map(({ name, role, text, rating }) => (
              <div key={name} className="bg-slate-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg leading-none">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{text}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-navy-900 px-4 py-16">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Prêt à rejoindre l'espace pro ?</h2>
          <p className="text-white/60 text-sm">Connexion immédiate par lien email. Aucun mot de passe à retenir.</p>
          <Button
            size="lg"
            onClick={handleCTA}
            className="bg-amber-400 text-navy-900 hover:bg-amber-300 font-bold h-12 px-10 text-base"
          >
            {session ? 'Accéder à mon espace' : "Créer mon espace pro"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-white/30 text-xs">Paiement sécurisé par Stripe · Facturation disponible sur demande</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-14 bg-white">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-navy-900 mb-6">Questions fréquentes</h2>
          {[
            {
              q: 'Les crédits expirent-ils ?',
              a: "Non. Vos crédits sont valables sans limite de temps. C'est l'ERP généré qui a une validité légale de 6 mois.",
            },
            {
              q: "Puis-je retrouver un ERP généré il y a plusieurs semaines ?",
              a: "Oui. Votre espace pro conserve l'historique de tous vos ERPs (jusqu'à 100 documents) pendant 6 mois.",
            },
            {
              q: "Comment me connecter ?",
              a: "Par lien email (magic link) : entrez votre email, cliquez le lien reçu — c'est tout. Pas de mot de passe, pas de compte à créer.",
            },
            {
              q: "Puis-je obtenir une facture ?",
              a: "Oui. La facture est générée automatiquement par Stripe après chaque achat et vous est envoyée par email.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-1.5">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
            <span className="font-bold text-sm tracking-tight">EDL&amp;DIAGNOSTIC · Espace Pro</span>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-gray-400">
              <button onClick={() => navigate('/mentions-legales')} className="hover:text-white underline transition-colors">Mentions légales</button>
              <button onClick={() => navigate('/confidentialite')} className="hover:text-white underline transition-colors">Politique de confidentialité</button>
              <button onClick={() => navigate('/cgu')} className="hover:text-white underline transition-colors">CGV</button>
              <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Accès grand public</button>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-5 leading-relaxed">
            EDL&amp;DIAGNOSTIC — SIREN 123 456 789 ·
            Paiement sécurisé par Stripe · Données issues des APIs officielles de l'État (Géorisques, BRGM, IGN) ·
            Documents conformes à l'arrêté du 27/09/2022.
          </p>
        </div>
      </footer>

    </div>
  );
}
