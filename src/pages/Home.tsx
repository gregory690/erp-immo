import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  FileText,
  ArrowRight,
  AlertTriangle,
  Star,
  Key,
  Home as HomeIcon,
  CheckCircle2,
  BadgeCheck,
  XCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const GOV_SOURCES = [
  {
    name: 'Géorisques',
    domain: 'georisques.gouv.fr',
    desc: 'Risques naturels & technologiques',
  },
  {
    name: 'BRGM',
    domain: 'brgm.fr',
    desc: 'Bureau de Recherches Géologiques',
  },
  {
    name: 'Base Adresse Nationale',
    domain: 'data.gouv.fr',
    desc: 'Géocodage adresses officielles',
  },
  {
    name: 'IGN · Géoportail',
    domain: 'apicarto.ign.fr',
    desc: 'Données cadastrales',
  },
];

const FEATURES = [
  {
    icon: <BadgeCheck className="h-5 w-5 text-edl-700" />,
    title: 'Accepté par votre notaire',
    description: "Conforme à l'arrêté du 27/09/2022 · valide pour tout compromis de vente ou contrat de bail.",
  },
  {
    icon: <Shield className="h-5 w-5 text-edl-700" />,
    title: 'Tous les risques couverts',
    description: 'PPR, séisme, radon, argiles, CatNat, SIS, BASIAS, BASOL · aucun oubli possible.',
  },
  {
    icon: <Clock className="h-5 w-5 text-edl-700" />,
    title: 'Prêt avant votre rendez-vous',
    description: 'Généré en moins de 2 minutes depuis chez vous, sur mobile ou ordinateur.',
  },
  {
    icon: <FileText className="h-5 w-5 text-edl-700" />,
    title: 'Le meilleur prix du marché',
    description: 'Nos concurrents facturent généralement entre 30 et 35 €. Même document légal, même valeur, jusqu\'à 15 € de moins.',
  },
];

const STEPS = [
  {
    num: 1,
    title: "Saisissez l'adresse du bien",
    desc: "Trouvée et validée en quelques secondes via la Base Adresse Nationale officielle.",
  },
  {
    num: 2,
    title: 'Confirmez la position sur la carte',
    desc: 'Un marqueur précis pour des données géolocalisées exactes à la parcelle cadastrale.',
  },
  {
    num: 3,
    title: 'Les bases officielles sont interrogées',
    desc: 'Géorisques, cadastre, CatNat · tout se fait automatiquement, sans action de votre part.',
  },
  {
    num: 4,
    title: 'Téléchargez votre ERP',
    desc: 'PDF prêt, conforme, à transmettre à votre notaire, agence ou futur locataire.',
  },
];

const FAQ = [
  {
    q: "Est-ce légalement valide ?",
    a: "Oui. Les données proviennent de Géorisques (BRGM), base officielle imposée par la loi. Le document est conforme à l'arrêté du 27 septembre 2022.",
  },
  {
    q: "Mon notaire l'acceptera-t-il ?",
    a: "Oui. Il mentionne la source officielle, la date de réalisation et les références cadastrales · tout ce que votre notaire ou agence exige.",
  },
  {
    q: "Que risque-t-on sans ERP ?",
    a: "L'acheteur ou le locataire peut demander l'annulation du contrat ou une réduction du prix de vente (art. L125-5 Code de l'Environnement).",
  },
];

const TESTIMONIALS = [
  {
    text: "J'avais peur que le notaire refuse le document parce que c'était fait en ligne. Il n'a rien dit, il a juste vérifié la date et l'a annexé au compromis.",
    author: 'Marc D.',
    role: 'Vendeur, Nantes',
    initiales: 'MD',
  },
  {
    text: "Honnêtement je savais même pas que c'était à moi de le faire. Mon agent m'a expliqué, j'ai fait l'ERP le soir même. Ça m'a pris un quart d'heure, en comptant le temps de lire les instructions.",
    author: 'Lucie M.',
    role: 'Vendeuse, Rennes',
    initiales: 'LM',
  },
  {
    text: "Mon agence le facturait 75 €. Je me suis dit que j'allais chercher autre chose et je suis tombé ici. Le document rendu est identique, le notaire a rien remarqué.",
    author: 'Karim B.',
    role: 'Propriétaire bailleur, Lyon',
    initiales: 'KB',
  },
  {
    text: "J'étais pas sûre que les données soient vraiment officielles. Mais j'ai vérifié sur georisques.gouv.fr après coup, tout correspondait. Ça m'a rassurée.",
    author: 'Nathalie R.',
    role: 'Vendeuse, Toulouse',
    initiales: 'NR',
  },
  {
    text: "Le compromis était prévu le lendemain matin et on avait oublié l'ERP. Je l'ai fait à 22h, le PDF était là en 5 minutes. Le rendez-vous s'est passé sans problème.",
    author: 'Thomas & Julie V.',
    role: 'Vendeurs, Bordeaux',
    initiales: 'TJ',
  },
  {
    text: "Je loue deux appartements et je renouvelle l'ERP à chaque nouveau bail. 19,99 € à chaque fois, ça reste raisonnable pour rester en règle sans se prendre la tête.",
    author: 'Isabelle T.',
    role: 'Propriétaire bailleuse, Marseille',
    initiales: 'IT',
  },
  {
    text: "Je suis pas à l'aise avec l'administratif en général. Là j'ai juste tapé l'adresse, j'ai suivi les étapes, et c'était fait. Pas grand chose à dire de plus.",
    author: 'Patrick G.',
    role: 'Vendeur, Strasbourg',
    initiales: 'PG',
  },
];


function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent(c => (c + 1) % TESTIMONIALS.length);

  const t = TESTIMONIALS[current];

  return (
    <section className="py-14 px-4 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-navy-900 text-center mb-10">
          Ils ont évité le blocage
        </h2>

        <div className="relative">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6 px-6 sm:px-8 min-h-[180px] flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-base text-gray-700 leading-relaxed mb-6">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-black shrink-0">
                  {t.initiales}
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">{t.author}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flèches */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-5 h-9 w-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Avis précédent"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-5 h-9 w-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Avis suivant"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Points de navigation */}
        <div className="flex justify-center gap-2 mt-5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-edl-700' : 'w-2 bg-gray-300'}`}
              aria-label={`Avis ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Charge le script Trustindex et déplace le widget dans la hero dès qu'il est injecté
  useEffect(() => {
    const mount = document.getElementById('ti-hero-mount');
    if (!mount) return;

    // Surveille les ajouts dans le body — dès que Trustindex insère son widget, on le déplace
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (
            node instanceof HTMLElement &&
            node.tagName !== 'SCRIPT' &&
            node.id !== 'root'
          ) {
            mount.appendChild(node);
            observer.disconnect();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true });

    const script = document.createElement('script');
    script.src = 'https://cdn.trustindex.io/loader.js?6aad671652ea80386376f58365a';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      observer.disconnect();
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top bar */}
      <div className="bg-navy-900 text-white text-xs py-2 px-4 hidden sm:block">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-8">
          <span className="flex items-center gap-1.5"><span>⚡</span>Livraison en 2 minutes</span>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-1.5"><span>✓</span>Accepté par les notaires</span>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-1.5"><span>🔒</span>Données officielles Géorisques</span>
        </div>
      </div>

      {/* Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="bg-edl-700 rounded p-1.5">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-black text-navy-900 text-lg tracking-tight">EDL</span>
              <span className="font-bold text-edl-700 text-lg">&amp;</span>
              <span className="font-black text-navy-900 text-lg tracking-tight">DIAGNOSTIC</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            className="bg-edl-700 hover:bg-edl-800 text-white font-bold shrink-0 gap-2"
            onClick={() => navigate('/generer')}
          >
            Générer mon ERP
            <span className="hidden sm:inline bg-white/20 rounded px-1.5 py-0.5 text-xs font-semibold">19,99 €</span>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-white py-12 sm:py-20 px-4 relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge Marianne */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2.5 bg-white/15 border border-white/25 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                <img src="/marianne.png" alt="Marianne RF" className="h-full w-full object-contain" />
              </div>
              <span className="text-[11px] font-semibold text-white/95 uppercase tracking-widest">
                <span className="sm:hidden">Données officielles de l'État</span>
                <span className="hidden sm:inline">République Française · Données officielles</span>
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5 sm:mb-6 text-white uppercase tracking-tight">
            État des Risques et Pollutions en ligne
          </h1>
          <p className="text-base sm:text-lg text-white mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
            ERP obligatoire pour votre vente ou location · document conforme, accepté par
            les notaires et agences, disponible 7j/7 et 24h/24.
          </p>
          <div className="flex justify-center">
            <Button
              size="xl"
              className="w-full sm:w-auto bg-edl-700 hover:bg-edl-800 text-white font-bold shadow-lg"
              onClick={() => navigate('/generer')}
            >
              Établir mon état des risques
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          {/* Trustindex — badge avis clients */}
          <div id="ti-hero-mount" className="flex justify-center mt-5 mb-1 no-print" />

          <p className="text-xs text-white/95 mt-3 font-medium">
            ✓ 19,99 € · ✓ Données officielles Géorisques · ✓ PDF prêt en 2 minutes
          </p>
        </div>
      </section>

      {/* Trust strip — sources officielles */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold mb-5">
            Données issues des sources officielles de l'État français
          </p>
          <div className="flex flex-wrap justify-center gap-3">

            {/* République Française — Marianne officielle */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-[#c5d0e8] rounded-lg shadow-sm">
              <img
                src="/marianne.png"
                alt="Marianne — République Française"
                className="h-12 w-auto object-contain shrink-0"
              />
              <div>
                <p className="text-[9px] font-semibold text-[#002395] uppercase tracking-widest leading-none">République Française</p>
                <p className="text-xs font-black text-gray-900 leading-tight mt-0.5">Données publiques officielles</p>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">data.gouv.fr</p>
              </div>
            </div>

            {/* Badges gouvernementaux — barre bleue gauche */}
            {GOV_SOURCES.map(src => (
              <div
                key={src.name}
                className="relative flex items-center gap-2.5 pl-4 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#002395]" />
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-none">{src.name}</p>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5">{src.domain}</p>
                </div>
              </div>
            ))}

            {/* Badge conformité légale */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-green-50 border border-green-200 rounded-lg shadow-sm">
              <BadgeCheck className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-900 leading-none">Conforme</p>
                <p className="text-[10px] text-green-700 leading-none mt-0.5">Arrêté 27/09/2022</p>
              </div>
            </div>

            {/* Badge RGPD */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
              <Shield className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900 leading-none">RGPD</p>
                <p className="text-[10px] text-blue-600 leading-none mt-0.5">Données protégées</p>
              </div>
            </div>

            {/* Badge Stripe */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
              <Lock className="h-4 w-4 text-[#635BFF] shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">Paiement sécurisé</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">Stripe · SSL / 3D Secure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau urgence légale */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            <strong>Risque légal :</strong> Sans ERP, l'acheteur peut exiger une réduction de prix ou l'annulation de la vente.
            Pour les bailleurs, le contrat de bail peut être déclaré nul (art. L125-5 Code de l'Environnement). Validité : 6 mois.
          </p>
        </div>
      </div>

      {/* Pour qui */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-navy-900 text-center mb-2">
            Vous vendez ou vous louez ?
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">L'ERP est obligatoire dans les deux cas</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Vendeurs */}
            <Card className="border-2 border-navy-100 hover:border-edl-300 transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-navy-50 rounded-lg p-2.5">
                    <HomeIcon className="h-6 w-6 text-navy-900" />
                  </div>
                  <h3 className="font-black text-navy-900 text-lg">Vous vendez</h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Obligatoire avant la signature du compromis",
                    "Le notaire ou l'agence le réclame systématiquement",
                    "Sans ERP : annulation ou réduction de prix possible",
                    "Valable 6 mois à compter de sa date d'établissement",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-edl-700 hover:bg-edl-800 font-semibold"
                  onClick={() => navigate('/generer')}
                >
                  Générer l'ERP de ma vente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Bailleurs */}
            <Card className="border-2 border-navy-100 hover:border-edl-300 transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-navy-50 rounded-lg p-2.5">
                    <Key className="h-6 w-6 text-navy-900" />
                  </div>
                  <h3 className="font-black text-navy-900 text-lg">Vous louez</h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Obligatoire à chaque nouveau contrat de bail",
                    "À joindre au contrat de location avant la signature",
                    "Sans ERP : le bail peut être déclaré nul",
                    "À renouveler à chaque nouveau locataire",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-edl-700 hover:bg-edl-800 font-semibold"
                  onClick={() => navigate('/generer')}
                >
                  Générer l'ERP de ma location
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pourquoi nous */}
      <section className="py-14 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-navy-900 text-center mb-2">
            Pourquoi choisir EDL&amp;DIAGNOSTIC ?
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">Rapide, légal, économique</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <Card key={f.title} className="border-gray-200 hover:border-edl-300 hover:shadow-md transition-all group">
                <CardContent className="pt-5">
                  <div className="bg-edl-50 group-hover:bg-edl-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-navy-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-navy-900 text-center mb-2">
            Simple comme bonjour
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">4 étapes, moins de 2 minutes, depuis votre canapé</p>
          <div className="space-y-6">
            {STEPS.map(step => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="bg-edl-700 text-white rounded-full h-9 w-9 flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-md shadow-edl-900/20">
                  {step.num}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-navy-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ objections */}
      <section className="py-14 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-navy-900 text-center mb-10">
            Vos questions, réponses claires
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <Card key={q} className="border-gray-200">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-edl-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-navy-900 mb-1">{q}</p>
                      <p className="text-sm text-gray-600">{a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Lien exemple */}
            <Card className="border-gray-200">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-edl-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-navy-900 mb-1">À quoi ressemble un ERP ?</p>
                    <p className="text-sm text-gray-600 mb-2">Consultez un exemple de document complet généré par notre service — format PDF officiel, toutes rubriques incluses.</p>
                    <button
                      onClick={() => navigate('/exemple')}
                      className="text-sm text-edl-700 font-semibold underline underline-offset-2 hover:text-edl-800 transition-colors"
                    >
                      Voir un exemple de document ERP →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Without ERP warning card */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900 mb-1">Que se passe-t-il sans ERP ?</p>
                    <p className="text-sm text-red-700">
                      L'acheteur ou le locataire peut demander l'annulation du contrat ou une réduction du prix de vente
                      (art. L125-5 Code de l'Environnement). Un oubli qui peut coûter bien plus que 19,99 €.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prix */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-black text-navy-900 mb-2">Votre ERP en 2 minutes, pour 19,99 €</h2>
          <p className="text-gray-500 text-sm mb-8">Disponible 7j/7, 24h/24 · Accepté par les notaires et agences immobilières</p>

          <Card className="border-2 border-edl-700 shadow-xl">
            <CardContent className="pt-8 pb-8 space-y-5">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-gray-400 line-through text-xl font-semibold">34,99 €</span>
                  <span className="bg-edl-700 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md animate-bounce">🔥 −15 € de réduction</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-edl-700 uppercase tracking-widest">Seulement</span>
                  <p className="text-6xl font-black text-gray-900">19,99 €<span className="text-lg font-normal text-gray-500"> TTC</span></p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Nos concurrents facturent généralement entre 30 et 35 €</p>
              </div>
              <ul className="text-sm text-left space-y-2">
                {[
                  'ERP PDF conforme arrêté 27/09/2022',
                  'Valide 6 mois · vente ET location',
                  'Accepté par les notaires et agences',
                  'Tous les risques via Géorisques (BRGM)',
                  '4 cartes de risques géographiques incluses',
                  'Vue aérienne satellite IGN du bien',
                  'Références cadastrales + historique CatNat',
                  'PDF envoyé par email immédiatement après paiement',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button
                size="xl"
                className="w-full bg-edl-700 hover:bg-edl-800 text-white font-bold"
                onClick={() => navigate('/generer')}
              >
                Obtenir mon ERP · 19,99 €
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-xs text-gray-400">Paiement sécurisé par Stripe · SSL 256 bits</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Témoignages — Slider */}
      <TestimonialsSlider />

      {/* CTA final */}
      <section className="py-16 px-4 text-white text-center bg-edl-700">
        <h2 className="text-2xl sm:text-3xl font-black mb-3">
          Votre transaction ne peut pas attendre.
        </h2>
        <p className="text-red-100 mb-6 text-sm sm:text-base font-medium max-w-xl mx-auto">
          Générez votre ERP maintenant · 2 minutes suffisent pour ne pas retarder votre vente ou votre mise en location.
        </p>
        <Button
          size="xl"
          className="w-full sm:w-auto bg-white text-edl-700 hover:bg-gray-100 font-bold shadow-lg"
          onClick={() => navigate('/generer')}
        >
          Obtenir mon ERP · 19,99 €
          <ArrowRight className="h-5 w-5" />
        </Button>
        <p className="text-xs text-red-200 mt-4">Données officielles · PDF conforme · Téléchargement immédiat</p>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-edl-700 rounded p-1">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-white text-base tracking-tight">
                EDL<span className="text-edl-400">&</span>DIAGNOSTIC
              </span>
            </div>

            {/* Bloc RF officiel avec Marianne */}
            <div className="flex items-center gap-2.5 border border-white/10 rounded-lg px-3 py-2">
              <div className="bg-white rounded p-1 shrink-0">
                <img src="/marianne.png" alt="Marianne RF" className="h-7 w-auto object-contain" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest leading-none">République Française</p>
                <p className="text-[10px] text-white font-bold leading-none mt-0.5">Données publiques officielles</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
              <span>georisques.gouv.fr (BRGM)</span>
              <span>api-adresse.data.gouv.fr</span>
              <span>apicarto.ign.fr</span>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center space-y-2">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-white/70">
              <button onClick={() => navigate('/ressources')} className="hover:text-white underline transition-colors">Guide ERP</button>
              <button onClick={() => navigate('/faq')} className="hover:text-white underline transition-colors">FAQ</button>
              <button onClick={() => navigate('/exemple')} className="hover:text-white underline transition-colors">Exemple de document ERP</button>
              <button onClick={() => navigate('/mentions-legales')} className="hover:text-white underline transition-colors">Mentions légales</button>
              <button onClick={() => navigate('/cgu')} className="hover:text-white underline transition-colors">CGU / CGV</button>
              <button onClick={() => navigate('/confidentialite')} className="hover:text-white underline transition-colors">Politique de confidentialité</button>
            </div>
            <p className="text-xs text-gray-500">
              © 2026 EDL&amp;DIAGNOSTIC · Ce service ne constitue pas un avis juridique. Les données proviennent des APIs
              officielles publiques françaises. L'utilisateur est responsable de la vérification des informations avant usage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
