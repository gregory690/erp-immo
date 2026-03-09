import { useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { ChevronRight, Check, MapPin, Clock, Shield, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CITIES, getCityBySlug } from '../data/cities-seo';

export default function CityERP() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const city = slug ? getCityBySlug(slug) : undefined;

  useEffect(() => {
    if (!city) return;

    // Update page title
    document.title = `ERP ${city.name} — État des Risques et Pollutions en ligne | EDL&DIAGNOSTIC`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content',
        `Obtenez votre ERP pour ${city.name} (${city.departmentCode}) en ligne en 2 minutes. Document officiel conforme à l'arrêté du 27/09/2022. Données Géorisques. 19,99 € — livraison par email.`
      );
    }

    // Update canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://edl-diagnostic-erp.fr/erp/${city.slug}`);
    }

    // Inject JSON-LD for city page
    const existingLd = document.getElementById('city-ld');
    if (existingLd) existingLd.remove();
    const script = document.createElement('script');
    script.id = 'city-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": `ERP ${city.name} — État des Risques et Pollutions`,
      "description": `Service de génération d'ERP pour ${city.name} (${city.departmentCode}). Document officiel conforme à l'arrêté du 27/09/2022.`,
      "provider": {
        "@type": "Organization",
        "name": "EDL&DIAGNOSTIC",
        "url": "https://edletdiagnostic.fr"
      },
      "areaServed": {
        "@type": "City",
        "name": city.name,
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": city.department
        }
      },
      "offers": {
        "@type": "Offer",
        "price": "19.99",
        "priceCurrency": "EUR",
        "url": `https://edl-diagnostic-erp.fr/generer`
      }
    });
    document.head.appendChild(script);

    return () => {
      document.getElementById('city-ld')?.remove();
      // Restore defaults on unmount
      document.title = 'ERP en ligne — État des Risques et Pollutions | EDL&DIAGNOSTIC';
      metaDesc?.setAttribute('content', "Générez votre État des Risques et Pollutions (ERP) conforme à l'arrêté du 27/09/2022 en moins de 2 minutes. Données officielles Géorisques — accepté par les notaires. 19,99 €.");
      canonical?.setAttribute('href', 'https://edl-diagnostic-erp.fr/');
    };
  }, [city]);

  if (!city) return <Navigate to="/" replace />;

  const otherCities = CITIES.filter(c => c.slug !== city.slug).slice(0, 12);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-navy-900 text-sm">
            EDL&DIAGNOSTIC
          </Link>
          <Button
            size="sm"
            onClick={() => navigate('/generer')}
            className="bg-edl-700 hover:bg-edl-800 text-xs"
          >
            Générer mon ERP
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-navy-900 transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <span>ERP par ville</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">{city.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-edl-700" />
            <span className="text-sm font-medium text-edl-700">{city.department} ({city.departmentCode}) · {city.region}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 leading-tight mb-4">
            ERP immobilier à {city.name}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Obtenez votre <strong>État des Risques et Pollutions</strong> pour un bien situé à {city.name} ({city.departmentCode}).
            Document officiel conforme à l'arrêté du 27 septembre 2022, livré par email en moins de 2 minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/generer')}
              className="bg-edl-700 hover:bg-edl-800 font-semibold"
            >
              Générer mon ERP pour {city.name}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="h-4 w-4 text-green-600" />
              <span>19,99 € · Livraison immédiate</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">

            {/* Risques spécifiques */}
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-4">
                ERP à {city.name} : risques identifiés
              </h2>
              <p className="text-gray-600 mb-5 leading-relaxed">
                {city.description}
              </p>
              <div className="space-y-2.5">
                {city.risks.map((risk, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-sm font-medium text-amber-900">{risk}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Les risques exacts pour votre bien sont calculés en temps réel à partir des données officielles Géorisques lors de la génération de votre ERP.
              </p>
            </section>

            {/* Qu'est-ce que l'ERP */}
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-4">
                Qu'est-ce que l'ERP ?
              </h2>
              <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-3">
                <p>
                  L'<strong>État des Risques et Pollutions (ERP)</strong> est un document légal obligatoire en France
                  pour toute transaction immobilière — vente, location meublée ou non, bail commercial, VEFA.
                  Il est encadré par l'<strong>article L125-5 du Code de l'environnement</strong>.
                </p>
                <p>
                  Pour un bien situé à <strong>{city.name}</strong>, l'ERP doit informer l'acquéreur ou le locataire
                  sur l'ensemble des risques naturels, miniers, technologiques et de pollution
                  auxquels le bien est potentiellement exposé.
                </p>
                <p>
                  L'ERP doit être établi à partir des données officielles transmises par le préfet du
                  département <strong>{city.department} ({city.departmentCode})</strong>.
                  Notre service interroge directement les bases de données Géorisques pour garantir
                  la conformité réglementaire du document.
                </p>
              </div>
            </section>

            {/* Obligation légale */}
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-4">
                Obligation légale pour les biens à {city.name}
              </h2>
              <div className="bg-navy-900/5 border border-navy-900/15 rounded-xl p-5 space-y-3">
                {[
                  { label: "Vente immobilière", desc: "L'ERP doit être annexé à la promesse de vente ou à défaut à l'acte authentique." },
                  { label: "Location (bail d'habitation)", desc: "L'ERP doit être joint au contrat de location à chaque nouvelle signature ou renouvellement." },
                  { label: "Bail commercial", desc: "L'ERP est obligatoire lors de la conclusion ou du renouvellement d'un bail commercial." },
                  { label: "Validité : 6 mois", desc: "L'ERP a une durée de validité de 6 mois à compter de sa date d'établissement." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Comment ça marche */}
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-6">
                Comment obtenir votre ERP à {city.name} ?
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Saisissez l'adresse du bien",
                    desc: `Entrez l'adresse complète de votre bien à ${city.name}. La Base Adresse Nationale géolocalise automatiquement le bien.`,
                  },
                  {
                    step: "2",
                    title: "Analyse des risques en temps réel",
                    desc: `Nos serveurs interrogent Géorisques pour identifier tous les risques applicables à ${city.name} (${city.departmentCode}) : PPR, SIS, sismique, radon, argiles, sites pollués.`,
                  },
                  {
                    step: "3",
                    title: "Réception immédiate par email",
                    desc: "Votre ERP complet et conforme est généré et envoyé par email en moins de 2 minutes. Valable 6 mois, retéléchargeable à tout moment.",
                  },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-5">
                Questions fréquentes — ERP {city.name}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: `Mon bien à ${city.name} est-il obligatoirement soumis à l'ERP ?`,
                    a: `Oui, dès lors que ${city.name} est couverte par au moins un arrêté préfectoral relatif aux risques naturels, miniers ou technologiques — ce qui est le cas pour l'ensemble des communes du département ${city.department} (${city.departmentCode}).`,
                  },
                  {
                    q: "L'ERP généré est-il accepté par les notaires ?",
                    a: "Oui. Le document respecte le format officiel imposé par l'arrêté du 27 septembre 2022. Il intègre toutes les rubriques obligatoires et est généré à partir des données officielles Géorisques.",
                  },
                  {
                    q: "Combien coûte un ERP pour un bien à " + city.name + " ?",
                    a: "Notre service facture 19,99 € TTC par ERP. Il n'y a aucun abonnement ni frais cachés. Le document est disponible immédiatement après paiement.",
                  },
                  {
                    q: "Quelle est la différence avec un ERP réalisé par un diagnostiqueur ?",
                    a: `Notre service automatise la collecte des données officielles et génère le document conforme à la réglementation. Pour ${city.name}, les données proviennent directement de Géorisques (BRGM), la même source que celle utilisée par les professionnels du diagnostic.`,
                  },
                ].map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-2">{item.q}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Pricing card */}
              <div className="border-2 border-navy-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-navy-900" />
                  <p className="font-bold text-navy-900">ERP {city.name}</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-navy-900">19,99 €</p>
                  <p className="text-xs text-gray-400">TTC · paiement unique</p>
                </div>
                <div className="space-y-2">
                  {[
                    "Document officiel conforme",
                    "Données Géorisques en temps réel",
                    "Livraison par email < 2 min",
                    "Valable 6 mois",
                    "Retéléchargement illimité",
                    "Accepté par les notaires",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <p className="text-xs text-gray-700">{feat}</p>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full bg-edl-700 hover:bg-edl-800 font-semibold"
                  onClick={() => navigate('/generer')}
                >
                  Générer mon ERP
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Trust badges */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                {[
                  { icon: Shield, text: "Paiement sécurisé Stripe" },
                  { icon: Clock, text: "Livraison en moins de 2 minutes" },
                  { icon: Check, text: "Arrêté du 27/09/2022 respecté" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Internal links to other cities */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">ERP dans d'autres villes</h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.map(c => (
              <Link
                key={c.slug}
                to={`/erp/${c.slug}`}
                className="text-xs text-navy-900 border border-navy-900/20 rounded-full px-3 py-1.5 hover:bg-navy-900/5 transition-colors"
              >
                ERP {c.name}
              </Link>
            ))}
            <Badge variant="outline" className="text-xs text-gray-400">
              + {CITIES.length - 12} villes
            </Badge>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-gray-100 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} EDL&DIAGNOSTIC — ERP en ligne
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="/mentions-legales" className="hover:text-gray-600">Mentions légales</Link>
            <Link to="/cgu" className="hover:text-gray-600">CGU</Link>
            <Link to="/confidentialite" className="hover:text-gray-600">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
