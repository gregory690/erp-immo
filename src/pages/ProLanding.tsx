import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Building2, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getProSession } from '../services/pro.service';

const PACK_10_FEATURES = [
  '10 crédits ERP sans expiration',
  'PDF conforme arrêté 27/09/2022',
  'Données officielles Géorisques & IGN',
  'Historique & re-téléchargement',
];

const PACK_50_FEATURES = [
  '50 crédits ERP sans expiration',
  'Tout le contenu du Pack 10',
  'Support dédié par email',
  'Facture Stripe automatique',
];

const REVIEWS = [
  {
    name: 'Sophie M.',
    role: 'Diagnostiqueuse — Lyon',
    text: "15 ERPs par mois, le dashboard centralise tout. Les notaires l'acceptent sans discussion.",
  },
  {
    name: 'Thierry B.',
    role: 'Agent immobilier — Bordeaux',
    text: "Données Géorisques officielles, arrêté 2022 respecté. Le PDF est prêt en 2 minutes chrono.",
  },
  {
    name: 'Camille R.',
    role: 'Gestionnaire de patrimoine — Paris',
    text: "Facturation mensuelle, support réactif. La formule sur mesure s'adapte parfaitement à notre cabinet.",
  },
];

export default function ProLanding() {
  const navigate = useNavigate();
  const session = getProSession();

  function handleCTA() {
    navigate(session ? '/pro/dashboard' : '/pro/login');
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-navy-900 px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-3 py-1 mb-8">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-white/70">Espace partenaire EDL&amp;DIAGNOSTIC</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1] max-w-2xl">
            L'ERP professionnel pour les diagnostiqueurs
          </h1>
          <p className="text-white/50 text-base mt-5 max-w-lg leading-relaxed">
            Crédits en volume, historique centralisé, PDF conforme en moins de 2 minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-amber-400 text-navy-900 hover:bg-amber-300 font-bold h-11 px-7 rounded-lg"
            >
              {session ? 'Mon espace pro' : "Accéder à l'espace pro"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <span className="text-white/30 text-xs">Connexion par lien email · Sans mot de passe</span>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-8">
            {[
              { value: '< 2 min', label: 'par ERP généré' },
              { value: '100 %', label: 'données officielles État' },
              { value: 'Aucune', label: 'expiration des crédits' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-white/35 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-2">Tarifs</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Choisissez votre volume</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

            {/* Pack 10 */}
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Découverte</p>
              <p className="text-3xl font-extrabold text-navy-900">
                79 €<span className="text-sm font-normal text-gray-400 ml-1.5">HT</span>
              </p>
              <p className="text-xs text-gray-400 mt-1.5 mb-7">94,80 € TTC · 7,90 € HT / ERP</p>
              <ul className="space-y-3 flex-1 mb-7">
                {PACK_10_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-navy-900 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                variant="outline"
                className="w-full border-gray-200 text-navy-900 hover:bg-navy-900 hover:text-white font-semibold rounded-lg transition-colors"
              >
                Commencer
              </Button>
            </div>

            {/* Pack 50 */}
            <div className="bg-navy-900 rounded-xl p-6 flex flex-col relative">
              <span className="absolute -top-3 left-5 inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                <span className="animate-bounce inline-block">🔥</span>
                Notre recommandation
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-5">Professionnel</p>
              <p className="text-3xl font-extrabold text-white">
                199 €<span className="text-sm font-normal text-white/40 ml-1.5">HT</span>
              </p>
              <p className="text-xs text-white/35 mt-1.5 mb-7">238,80 € TTC · 3,98 € HT / ERP</p>
              <ul className="space-y-3 flex-1 mb-7">
                {PACK_50_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCTA}
                className="w-full bg-amber-400 text-navy-900 hover:bg-amber-300 font-bold rounded-lg"
              >
                Choisir ce pack
              </Button>
            </div>

            {/* Sur mesure */}
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Sur mesure</p>
              <p className="text-xl font-bold text-navy-900 mb-2">Volume & Agences</p>
              <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                Plus de 50 ERPs par mois ou besoin d'une intégration personnalisée ?
              </p>
              <ul className="space-y-3 flex-1 mb-7">
                {[
                  'Tarif négocié selon volume',
                  'Facturation mensuelle possible',
                  'Intégration API sur demande',
                  'Gestionnaire de compte dédié',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-navy-900 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => { window.location.href = 'mailto:pro@edletdiagnostic.fr?subject=Offre%20sur%20mesure%20ERP'; }}
                variant="outline"
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg"
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Nous contacter
              </Button>
            </div>

          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Paiement sécurisé par Stripe · Facture automatique après chaque achat
          </p>
        </div>
      </section>

      {/* 3 points clés */}
      <section className="px-4 py-14 sm:py-16 bg-slate-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {[
            {
              title: 'Prêt en moins de 2 minutes',
              desc: "Adresse → PDF conforme. Sans aller-retour, sans délai. Idéal entre deux rendez-vous.",
            },
            {
              title: "Données officielles de l'État",
              desc: "APIs Géorisques, BRGM et IGN. Documents acceptés par les notaires et agences immobilières.",
            },
            {
              title: 'Crédits sans expiration',
              desc: "Achetez quand ça vous convient. Vos crédits restent disponibles sans aucune limite de temps.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="space-y-2">
              <p className="font-bold text-navy-900">{title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-4 py-14 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-2">En 3 étapes</p>
            <h2 className="text-2xl font-bold text-navy-900">Opérationnel en moins de 5 minutes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {[
              {
                num: '01',
                title: 'Créez votre espace',
                desc: 'Email uniquement — un lien de connexion vous est envoyé instantanément. Aucun mot de passe à retenir.',
              },
              {
                num: '02',
                title: 'Achetez vos crédits',
                desc: 'Choisissez le pack adapté à votre volume. Paiement sécurisé, facture automatique par email.',
              },
              {
                num: '03',
                title: 'Générez à la demande',
                desc: "Saisissez l'adresse depuis votre dashboard — le PDF est prêt en moins de 2 minutes.",
              },
            ].map(step => (
              <div key={step.num} className="flex gap-7 py-6">
                <span className="text-3xl font-black text-gray-100 shrink-0 w-10 text-right leading-none pt-0.5">
                  {step.num}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avis */}
      <section className="px-4 py-14 sm:py-16 bg-slate-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-2">Retours partenaires</p>
            <h2 className="text-2xl font-bold text-navy-900">Ce qu'en disent les pros</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REVIEWS.map(({ name, role, text }) => (
              <div key={name} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm leading-none">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-navy-900 px-4 py-14 sm:py-16">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Prêt à rejoindre l'espace pro ?</h2>
          <p className="text-white/40 text-sm">Connexion instantanée par lien email. Aucun mot de passe.</p>
          <Button
            size="lg"
            onClick={handleCTA}
            className="bg-amber-400 text-navy-900 hover:bg-amber-300 font-bold h-11 px-8 rounded-lg"
          >
            {session ? 'Accéder à mon espace' : "Créer mon espace pro"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-white/10 px-4 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-bold text-white">EDL&amp;DIAGNOSTIC · Espace Pro</span>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-gray-500">
            <button onClick={() => navigate('/mentions-legales')} className="hover:text-white transition-colors">Mentions légales</button>
            <button onClick={() => navigate('/confidentialite')} className="hover:text-white transition-colors">Confidentialité</button>
            <button onClick={() => navigate('/cgu')} className="hover:text-white transition-colors">CGV</button>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Accès grand public</button>
          </div>
        </div>
        <p className="text-[11px] text-gray-600 text-center mt-4">
          Données Géorisques, BRGM, IGN · Conformité arrêté 27/09/2022 · Paiement sécurisé Stripe
        </p>
      </footer>

    </div>
  );
}
