import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Building2, ChevronDown, Clock, Banknote, BadgeCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getProSession } from '../services/pro.service';


const REVIEWS = [
  {
    name: 'Marc Durand',
    role: 'Diagnostiqueur indépendant, Nantes',
    text: "J'ai envoyé le premier ERP directement à l'étude sans rien dire. Aucun retour, aucune question. Depuis, je l'utilise pour tous mes ERP de la semaine.",
  },
  {
    name: 'Isabelle Tessier',
    role: 'Diagnostiqueuse, Toulouse',
    text: "J'avais des doutes sur la fiabilité des données. J'ai comparé avec ce que je produisais manuellement depuis Géorisques — résultat identique, en 2 minutes au lieu de 20. Je me suis posé la question une seule fois.",
  },
  {
    name: 'Laurent Perrin',
    role: 'Diagnostiqueur, Marseille',
    text: "J'avais déjà un logiciel en abonnement que j'utilisais 3 mois sur 12. Là j'achète des crédits quand j'en ai besoin, rien de plus. Pour un indépendant à volume variable, c'est la seule formule qui a du sens.",
  },
];

const FAQS = [
  {
    q: "Qu'est-ce qu'un État des Risques et Pollutions (ERP) ?",
    a: "L'ERP est un document réglementaire obligatoire depuis l'arrêté du 27 septembre 2022. Il informe l'acheteur ou le locataire des risques naturels, miniers, technologiques, sismiques et de pollution des sols auxquels est exposé un bien immobilier. Il doit être annexé à tout compromis de vente ou bail.",
  },
  {
    q: "Combien de temps faut-il pour générer un ERP avec votre outil ?",
    a: "Moins de 2 minutes. Vous saisissez l'adresse, les données sont récupérées automatiquement depuis les APIs officielles (Géorisques, IGN, BRGM), et le PDF conforme est généré instantanément. Pas de ressaisie, pas de délai.",
  },
  {
    q: "Les ERP générés sont-ils acceptés par les notaires et agences immobilières ?",
    a: "Oui. Nos documents sont générés à partir des mêmes sources que les services officiels de l'État (Géorisques, cadastre IGN). Le format et le contenu sont conformes à l'arrêté du 27/09/2022. Ils sont acceptés sans réserve par les études notariales.",
  },
  {
    q: "Mes crédits ont-ils une date d'expiration ?",
    a: "Non. Vos crédits sont valables sans limite de durée. Achetez quand votre activité le demande, utilisez-les à votre rythme.",
  },
  {
    q: "Puis-je acheter des crédits sans abonnement mensuel ?",
    a: "Oui, c'est justement le principe. Pas d'abonnement, pas d'engagement. Vous achetez un pack de crédits une fois, vous les utilisez quand vous en avez besoin. Une facture vous est envoyée automatiquement après chaque achat.",
  },
  {
    q: "Comment fonctionne la marketplace de contacts diagnostics ?",
    a: "La marketplace met en relation des diagnostiqueurs avec des particuliers ou professionnels qui recherchent activement un professionnel dans leur zone. Vous définissez votre secteur géographique et le nombre de missions que vous souhaitez recevoir par mois — vous ne payez que les demandes reçues. Le système est automatique : dès qu'une mission qualifiée est disponible dans votre secteur, elle vous est transmise.",
  },
];

const CAP_OPTIONS = ['5 missions / mois', '10 missions / mois', '20 missions / mois', '50 missions / mois', 'Plus de 50'];

export default function ProLanding() {
  const navigate = useNavigate();
  const session = getProSession();

  // ── SEO ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.title;
    document.title = 'ERP Professionnel pour Diagnostiqueurs — Logiciel en ligne | EDL&DIAGNOSTIC';

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDesc = meta?.content ?? '';
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.content =
      "Générez vos États des Risques et Pollutions en moins de 2 minutes. Logiciel ERP professionnel pour diagnostiqueurs immobiliers — données officielles Géorisques, conformité arrêté 2022, crédits sans expiration.";

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'pro-jsonld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: "ERP Pro — EDL&DIAGNOSTIC",
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        "Logiciel de génération d'États des Risques et Pollutions pour diagnostiqueurs immobiliers professionnels. Conformité arrêté 27/09/2022, données Géorisques & IGN.",
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '60',
        highPrice: '150',
        offerCount: '3',
      },
      provider: {
        '@type': 'Organization',
        name: 'EDL&DIAGNOSTIC',
        url: 'https://edl-diagnostic-erp.fr',
      },
    });
    document.head.appendChild(script);

    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
      const s = document.getElementById('pro-jsonld');
      if (s) s.remove();
    };
  }, []);

  // ── Scroll to hash anchor (ex: /pro#leads depuis le dashboard) ───────────
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, []);

  // ── Slider simulateur ─────────────────────────────────────────────────────
  const [sliderQty, setSliderQty] = useState(20);

  const PACKS = [
    { name: 'Découverte', erps: 10,  totalHT: 60,  pricePerErp: 6    },
    { name: 'Pro',        erps: 15,  totalHT: 75,  pricePerErp: 5    },
    { name: 'Pro+',       erps: 50,  totalHT: 150, pricePerErp: 3    },
    { name: 'Expert',     erps: 100, totalHT: 250, pricePerErp: 2.5  },
    { name: 'Premium',    erps: 150, totalHT: 300, pricePerErp: 2    },
    { name: 'Élite',      erps: 250, totalHT: 437, pricePerErp: 1.75 },
    { name: 'Ultime',     erps: 500, totalHT: 500, pricePerErp: 1    },
  ];

  function getRecommendedPack(qty: number) {
    if (qty <= 10)  return PACKS[0];
    if (qty <= 15)  return PACKS[1];
    if (qty <= 50)  return PACKS[2];
    if (qty <= 100) return PACKS[3];
    if (qty <= 150) return PACKS[4];
    if (qty <= 250) return PACKS[5];
    return PACKS[6];
  }

  const recommendedPack = getRecommendedPack(sliderQty);

  // ── FAQ state ─────────────────────────────────────────────────────────────
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── Waitlist state ────────────────────────────────────────────────────────
  const [wEmail, setWEmail] = useState('');
  const [wDept, setWDept] = useState('');
  const [wCap, setWCap] = useState('');
  const [wStatus, setWStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!wEmail || !wDept || !wCap) return;
    setWStatus('loading');
    try {
      const res = await fetch('/api/pro-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'waitlist', email: wEmail, dept: wDept, cap: wCap }),
      });
      if (!res.ok) throw new Error();
      setWStatus('success');
    } catch {
      setWStatus('error');
    }
  }

  function handleCTA() {
    navigate(session ? '/pro/dashboard' : '/pro/login');
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-navy-900 px-4 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.1)_0%,_transparent_55%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Colonne gauche — texte ── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-8">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-white/80">Espace professionnel EDL&amp;DIAGNOSTIC</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                Gagnez du temps.<br />
                Réduisez vos coûts.<br />
                <span className="text-amber-400">Restez conformes.</span>
              </h1>
              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: <Clock className="h-5 w-5 text-amber-400 shrink-0" />,
                    title: 'ERP généré en moins de 2 minutes',
                    desc: "Arrêtez de passer 20 minutes sur les sites officiels. Adresse saisie → PDF prêt.",
                  },
                  {
                    icon: <Banknote className="h-5 w-5 text-amber-400 shrink-0" />,
                    title: 'À partir de 3 € HT le document',
                    desc: "Pas d'abonnement. Vous achetez des ERPs quand vous en avez besoin, rien de plus.",
                  },
                  {
                    icon: <BadgeCheck className="h-5 w-5 text-amber-400 shrink-0" />,
                    title: 'Accepté sans réserve par les notaires',
                    desc: "Sources Géorisques & IGN officielles. Conforme à l'arrêté du 27/09/2022.",
                  },
                ].map(({ icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-0.5">{icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{title}</p>
                      <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleCTA}
                  className="bg-amber-400 text-navy-900 hover:bg-amber-300 font-bold h-12 px-8 rounded-lg text-base"
                >
                  {session ? 'Mon espace pro' : "Accéder à l'espace pro"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <span className="text-white/55 text-sm">Sans abonnement · Connexion par lien email</span>
              </div>
            </div>

            {/* ── Colonne droite — Simulateur de tarif ── */}
            <div className="hidden lg:block space-y-3">

              <div className="rounded-2xl overflow-hidden border border-white/10">

                {/* Header + slider */}
                <div className="bg-white/5 px-5 pt-5 pb-4">
                  <p className="text-white/60 text-[11px] uppercase tracking-widest font-semibold mb-3">Simulez votre tarif</p>
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-white font-semibold text-sm">Combien d'ERPs par mois ?</p>
                    <p className="text-amber-400 font-extrabold text-2xl leading-none">{sliderQty}</p>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={sliderQty}
                    onChange={e => setSliderQty(Number(e.target.value))}
                    className="w-full cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-white/50 mt-1">
                    <span>1 ERP</span>
                    <span>500 ERPs</span>
                  </div>
                </div>

                {/* Result */}
                <div className="border-t border-white/10 px-5 py-5 bg-amber-400/8">
                  <p className="text-white/65 text-xs mb-4">
                    Pack recommandé : <span className="text-white font-semibold">{recommendedPack.name}</span>
                    {' '}· {recommendedPack.erps} ERPs
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-amber-400 font-extrabold text-4xl leading-none">{recommendedPack.pricePerErp}€</p>
                      <p className="text-white/70 text-xs mt-1">HT / ERP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xl">{recommendedPack.totalHT} € HT</p>
                      <p className="text-white/60 text-xs mt-0.5">soit {(recommendedPack.totalHT * 1.2).toFixed(0)} € TTC</p>
                    </div>
                  </div>
                  {recommendedPack.erps > sliderQty && (
                    <p className="text-white/60 text-[11px] mt-4 leading-relaxed">
                      +{recommendedPack.erps - sliderQty} ERPs en réserve pour les prochains mois — sans date limite.
                    </p>
                  )}
                </div>

                {/* Guarantees */}
                <div className="bg-white/5 px-5 py-4 border-t border-white/10 space-y-2">
                  {[
                    'Sans abonnement — aucune charge fixe',
                    'ERPs valables sans date limite',
                    'Facture envoyée automatiquement',
                  ].map(g => (
                    <div key={g} className="flex items-center gap-2.5">
                      <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <p className="text-xs text-white/80">{g}</p>
                    </div>
                  ))}
                </div>

              </div>

              {/* Trust note */}
              <div className="bg-white/8 border border-white/10 rounded-xl px-5 py-3.5 flex items-center gap-3">
                <BadgeCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-white/70 text-xs">Données officielles Géorisques & IGN · Conformité arrêté 27/09/2022</p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:py-16 bg-slate-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-2">En 3 étapes</p>
            <h2 className="text-2xl font-bold text-navy-900">Opérationnel en moins de 5 minutes</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              {
                num: '01',
                title: 'Créez votre espace pro',
                desc: "Email uniquement — un lien de connexion vous est envoyé instantanément. Aucun mot de passe à retenir.",
              },
              {
                num: '02',
                title: 'Achetez vos crédits ERP',
                desc: "Choisissez le pack adapté à votre volume d'activité. Paiement sécurisé Stripe, facture automatique par email.",
              },
              {
                num: '03',
                title: 'Générez à la demande',
                desc: "Saisissez l'adresse depuis votre dashboard — le PDF conforme est prêt en moins de 2 minutes.",
              },
            ].map(step => (
              <div key={step.num} className="flex gap-7 py-6">
                <span className="text-3xl font-black text-navy-900/25 shrink-0 w-10 text-right leading-none pt-0.5">
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

      {/* ── Marketplace Leads ─────────────────────────────────────────────── */}
      <section id="leads" className="px-4 py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — pitch */}
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-amber-700">Lancement bientôt — places limitées par zone</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 leading-tight mb-4">
                Recevez des demandes de clients directement dans votre zone
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Notre marketplace met en relation des diagnostiqueurs avec des particuliers et agences qui cherchent activement un professionnel. Vous définissez votre secteur et le nombre de missions souhaitées par mois — nous vous transmettrons les demandes en automatique.
              </p>

              <ul className="space-y-4">
                {[
                  {
                    title: 'Leads qualifiés dans votre secteur',
                    desc: 'Particuliers vendeurs, agences, notaires — contacts vérifiés avec adresse du bien et type de diagnostic.',
                  },
                  {
                    title: 'Achat à l\'unité, sans abonnement',
                    desc: 'Vous payez uniquement les leads reçus. Pas d\'engagement, pas de forfait mensuel.',
                  },
                  {
                    title: 'Nombre de missions ajustable',
                    desc: "Indiquez combien de demandes vous souhaitez recevoir par mois. Le système s'arrête automatiquement dès que ce nombre est atteint.",
                  },
                ].map(({ title, desc }) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-1 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-amber-600" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — waitlist form */}
            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-7">
              {wStatus === 'success' ? (
                <div className="text-center py-8 space-y-3">
                  <div className="text-4xl">✅</div>
                  <p className="font-bold text-navy-900 text-lg">Vous êtes sur la liste !</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Nous vous contacterons en priorité au lancement dans votre département.
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-navy-900 text-lg mb-1">Rejoindre la liste d'attente</p>
                  <p className="text-xs text-gray-500 mb-6">
                    Soyez notifié en priorité au lancement dans votre département.
                  </p>

                  <form onSubmit={handleWaitlist} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Email professionnel
                      </label>
                      <input
                        type="email"
                        required
                        value={wEmail}
                        onChange={e => setWEmail(e.target.value)}
                        placeholder="vous@exemple.fr"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/30 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Département(s) d'intervention
                      </label>
                      <input
                        type="text"
                        required
                        value={wDept}
                        onChange={e => setWDept(e.target.value)}
                        placeholder="Ex : 69 · Rhône, 01 · Ain"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/30 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Missions souhaitées par mois
                      </label>
                      <select
                        required
                        value={wCap}
                        onChange={e => setWCap(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/30 bg-white"
                      >
                        <option value="">Choisissez un nombre</option>
                        {CAP_OPTIONS.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    {wStatus === 'error' && (
                      <p className="text-xs text-red-600">Une erreur est survenue. Réessayez ou contactez-nous.</p>
                    )}

                    <Button
                      type="submit"
                      disabled={wStatus === 'loading'}
                      className="w-full bg-navy-900 hover:bg-navy-900/90 text-white font-bold rounded-lg h-10"
                    >
                      {wStatus === 'loading' ? 'Envoi…' : "Je veux recevoir des leads"}
                      {wStatus !== 'loading' && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>

                    <p className="text-[11px] text-gray-400 text-center">
                      Sans engagement · Aucune carte bancaire requise
                    </p>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── 3 points clés ────────────────────────────────────────────────── */}
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

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-2">FAQ</p>
            <h2 className="text-2xl font-bold text-navy-900">Questions fréquentes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-semibold text-gray-900 text-sm leading-snug">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed pr-8">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avis ─────────────────────────────────────────────────────────── */}
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

      {/* ── CTA final ────────────────────────────────────────────────────── */}
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

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-navy-900 border-t border-white/10 px-4 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-bold text-white">EDL&amp;DIAGNOSTIC · Espace Pro</span>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-white/45">
            <button onClick={() => navigate('/mentions-legales')} className="hover:text-white transition-colors">Mentions légales</button>
            <button onClick={() => navigate('/confidentialite')} className="hover:text-white transition-colors">Confidentialité</button>
            <button onClick={() => navigate('/cgu')} className="hover:text-white transition-colors">CGV</button>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Accès grand public</button>
          </div>
        </div>
        <p className="text-[11px] text-white/35 text-center mt-4">
          Données Géorisques, BRGM, IGN · Conformité arrêté 27/09/2022 · Paiement sécurisé Stripe
        </p>
      </footer>

    </div>
  );
}
