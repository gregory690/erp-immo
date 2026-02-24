import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Clock,
  FileText,
  ArrowRight,
  MapPin,
  AlertTriangle,
  Star,
  Phone,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const FEATURES = [
  {
    icon: <MapPin className="h-5 w-5 text-edl-700" />,
    title: 'Adresse en temps réel',
    description: 'Autocomplete via la Base Adresse Nationale officielle',
  },
  {
    icon: <Shield className="h-5 w-5 text-edl-700" />,
    title: '10 risques analysés',
    description: 'PPR, séisme, radon, argiles, BASIAS/BASOL, SIS, CatNat…',
  },
  {
    icon: <Clock className="h-5 w-5 text-edl-700" />,
    title: 'Moins de 2 minutes',
    description: 'Résultats en temps réel via les APIs officielles Géorisques',
  },
  {
    icon: <FileText className="h-5 w-5 text-edl-700" />,
    title: 'PDF conforme',
    description: "Document légal conforme à l'arrêté du 27/09/2022",
  },
];

const STEPS = [
  { num: 1, title: "Saisissez l'adresse", desc: 'Autocomplete intelligent via la Base Adresse Nationale' },
  { num: 2, title: 'Confirmez la localisation', desc: 'Positionnez le marqueur précisément sur une carte interactive' },
  { num: 3, title: 'Calcul automatique', desc: 'Interrogation en temps réel de Géorisques (API officielle BRGM)' },
  { num: 4, title: 'Téléchargez votre ERP', desc: 'PDF généré, conforme et prêt à annexer au compromis de vente' },
];

const TESTIMONIALS = [
  {
    text: "J'ai pu générer l'ERP de mon appartement en 90 secondes. Le document est complet et le notaire l'a accepté sans réserve.",
    author: 'Sophie M.',
    role: 'Venderesse particulière, Lyon',
  },
  {
    text: 'Enfin un outil qui interroge directement Géorisques. Fini les prestataires qui facturent 50 € pour ce qui est gratuit.',
    author: 'Thomas R.',
    role: 'Agent immobilier, Bordeaux',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top bar EDL style */}
      <div className="bg-navy-900 text-white text-xs py-2 px-4 hidden sm:block">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span>Service EDL&amp;DIAGNOSTIC · Diagnostics immobiliers certifiés</span>
          <a href="tel:+33622775769" className="flex items-center gap-1.5 hover:text-edl-300 transition-colors font-medium">
            <Phone className="h-3 w-3" />
            06 22 77 57 69
          </a>
        </div>
      </div>

      {/* Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo EDL style */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="bg-edl-700 rounded p-1.5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-black text-navy-900 text-lg tracking-tight">EDL</span>
                <span className="font-bold text-edl-700 text-lg">&amp;</span>
                <span className="font-black text-navy-900 text-lg tracking-tight">DIAGNOSTIC</span>
              </div>
            </div>
            <div className="hidden sm:block h-6 w-px bg-gray-300" />
            <span className="hidden sm:block text-xs text-gray-500 font-medium">État des Risques en ligne</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-navy-900 hover:text-edl-700" onClick={() => navigate('/dashboard')}>
              Mon espace
            </Button>
            <Button
              size="sm"
              className="bg-edl-700 hover:bg-edl-800 text-white font-semibold"
              onClick={() => navigate('/generer')}
            >
              Générer mon ERP
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — fond dégradé couleurs EDL */}
      <section
        className="text-white py-12 sm:py-20 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #211f54 0%, #2a2472 50%, #b20f11 100%)' }}
      >
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <Badge className="bg-edl-700/80 text-white border-edl-600 mb-6 text-xs font-semibold tracking-wide uppercase">
            Conforme · Arrêté du 27 septembre 2022
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5 sm:mb-6 text-white">
            Votre État des Risques et Pollutions{' '}
            <span className="text-yellow-300 underline decoration-wavy decoration-yellow-400/50">
              en moins de 2 minutes
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
            Document légalement obligatoire pour toute vente ou location. Données officielles
            Géorisques — PPR, séisme, radon, argiles, CatNat, SIS.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="xl"
              className="bg-edl-700 hover:bg-edl-800 text-white font-bold shadow-lg shadow-edl-900/40"
              onClick={() => navigate('/generer')}
            >
              Générer mon ERP — 9,99 €
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 font-semibold"
              onClick={() => navigate('/dashboard')}
            >
              Voir un exemple
            </Button>
          </div>
          <p className="text-xs text-gray-300 mt-5 font-medium">
            ✓ 9,99 € seulement · ✓ Données officielles · ✓ PDF téléchargeable immédiatement
          </p>
        </div>
      </section>

      {/* Bandeau légal */}
      <div className="bg-edl-50 border-b border-edl-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-edl-700 shrink-0 mt-0.5" />
          <p className="text-sm text-edl-800">
            <strong>Rappel légal :</strong> L'ERP est obligatoire pour toute vente ou location (loi Alur 2014).
            Validité 6 mois. L'absence de ce document expose le vendeur à une réduction de prix ou à la résolution de la vente.
          </p>
        </div>
      </div>

      {/* Pourquoi */}
      <section className="py-16 px-4 bg-navy-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-navy-900 text-center mb-2">
            Pourquoi choisir EDL&amp;DIAGNOSTIC ?
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">Un service rapide, fiable et 100 % conforme</p>
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
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-navy-900 text-center mb-12">
            Comment ça marche ?
          </h2>
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

      {/* Prix */}
      <section className="py-16 px-4 bg-navy-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-black text-navy-900 mb-2">Un tarif simple et transparent</h2>
          <p className="text-gray-500 text-sm mb-8">Pas d'abonnement, pas de surprise</p>

          <Card className="border-2 border-edl-700 shadow-xl">
            <CardContent className="pt-8 pb-8 space-y-5">
              <Badge className="bg-edl-700 text-white text-xs px-3 font-semibold">
                🔥 Offre de lancement
              </Badge>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-gray-400 line-through text-lg font-medium">35,00 €</span>
                  <span className="text-xs text-gray-400 italic">(prix diagnostiqueur)</span>
                </div>
                <p className="text-5xl font-black text-edl-700">9,99 €<span className="text-lg font-normal text-gray-500"> TTC</span></p>
                <p className="text-xs text-gray-400 mt-1">8,32 € HT · Téléchargement immédiat</p>
              </div>
              <ul className="text-sm text-left space-y-2">
                {['ERP PDF conforme arrêté 27/09/2022', '10 risques analysés via Géorisques', 'Validité 6 mois', 'Références cadastrales incluses'].map(f => (
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
                Obtenir mon ERP
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-navy-900 text-center mb-10">
            Ils nous font confiance
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-gray-200 hover:border-edl-200 transition-colors">
                <CardContent className="pt-5">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic mb-4">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-bold text-navy-900">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 text-white text-center" style={{ background: 'linear-gradient(135deg, #211f54, #b20f11)' }}>
        <h2 className="text-2xl font-black mb-3">Prêt à générer votre ERP ?</h2>
        <p className="text-gray-200 mb-6 text-sm font-medium">
          Service EDL&amp;DIAGNOSTIC · Données officielles · Document conforme · 9,99 € seulement
        </p>
        <Button
          size="xl"
          className="bg-white text-edl-700 hover:bg-gray-100 font-bold shadow-lg"
          onClick={() => navigate('/generer')}
        >
          Commencer maintenant
          <ArrowRight className="h-5 w-5" />
        </Button>
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
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-400">
              <span>Données : georisques.gouv.fr (BRGM)</span>
              <span>Adresses : api-adresse.data.gouv.fr</span>
              <span>Cadastre : apicarto.ign.fr</span>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2024 EDL&amp;DIAGNOSTIC · Ce service ne constitue pas un avis juridique. Les données proviennent des APIs
              officielles publiques françaises. L'utilisateur est responsable de la vérification des informations avant usage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
