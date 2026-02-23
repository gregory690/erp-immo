import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Clock,
  FileText,
  ArrowRight,
  MapPin,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const FEATURES = [
  {
    icon: <MapPin className="h-5 w-5 text-navy-700" />,
    title: 'Adresse en temps réel',
    description: 'Autocomplete via la Base Adresse Nationale officielle',
  },
  {
    icon: <Shield className="h-5 w-5 text-navy-700" />,
    title: '10 risques analysés',
    description: 'PPR, séisme, radon, argiles, BASIAS/BASOL, SIS, CatNat…',
  },
  {
    icon: <Clock className="h-5 w-5 text-navy-700" />,
    title: 'Moins de 2 minutes',
    description: 'Résultats en temps réel via les APIs officielles Géorisques',
  },
  {
    icon: <FileText className="h-5 w-5 text-navy-700" />,
    title: 'PDF conforme',
    description: 'Document légal conforme à l\'arrêté du 27/09/2022',
  },
];

const STEPS = [
  { num: 1, title: 'Saisissez l\'adresse', desc: 'Autocomplete intelligent via la Base Adresse Nationale' },
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
    text: 'Enfin un outil qui interroge directement Géorisques. Fini les prestataires qui facturent 50€ pour ce qui est gratuit.',
    author: 'Thomas R.',
    role: 'Agent immobilier, Bordeaux',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-border bg-white/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-navy-900" />
            <span className="font-bold text-navy-900 text-lg">ERP.immo</span>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              Bêta gratuite
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Mon espace
            </Button>
            <Button
              size="sm"
              className="bg-navy-900 hover:bg-navy-800"
              onClick={() => navigate('/generer')}
            >
              Générer mon ERP
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-white/10 text-white border-white/20 mb-6 text-xs">
            Conforme · Arrêté du 27 septembre 2022
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Générez votre État des Risques et Pollutions{' '}
            <span className="text-yellow-300">en moins de 2 minutes</span>
          </h1>
          <p className="text-lg text-navy-200 mb-8 max-w-2xl mx-auto">
            Document légalement obligatoire pour toute vente ou location. Données officielles
            Géorisques — PPR, séisme, radon, argiles, CatNat, SIS — conformes à la réglementation française.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="xl"
              className="bg-white text-navy-900 hover:bg-white/90 font-semibold"
              onClick={() => navigate('/generer')}
            >
              Générer mon ERP gratuitement
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate('/dashboard')}
            >
              Voir un exemple
            </Button>
          </div>
          <p className="text-xs text-navy-300 mt-4">
            ✓ Gratuit en self-service · ✓ Données officielles · ✓ PDF téléchargeable immédiatement
          </p>
        </div>
      </section>

      {/* Alert banner */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
          <p className="text-sm text-orange-800">
            <strong>Rappel légal :</strong> L'ERP est obligatoire pour toute vente ou location depuis la loi Alur (2014).
            Validité 6 mois. L'absence de ce document expose le vendeur à une réduction de prix ou à la résolution de la vente.
          </p>
        </div>
      </div>

      {/* Features */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-10">
            Pourquoi ERP.immo ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <Card key={f.title} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="bg-navy-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="space-y-4">
            {STEPS.map(step => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="bg-navy-900 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-10">
            Ils ont utilisé ERP.immo
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i}>
                <CardContent className="pt-5">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic mb-4">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy-900 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Prêt à générer votre ERP ?</h2>
        <p className="text-navy-200 mb-6 text-sm">
          Données officielles · Document conforme · Gratuit en self-service
        </p>
        <Button
          size="xl"
          className="bg-white text-navy-900 hover:bg-white/90 font-semibold"
          onClick={() => navigate('/generer')}
        >
          Commencer maintenant
          <ArrowRight className="h-5 w-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 mb-4">
            <span>© 2024 ERP.immo</span>
            <span>Données : georisques.gouv.fr (BRGM)</span>
            <span>Adresses : api-adresse.data.gouv.fr</span>
            <span>Cadastre : apicarto.ign.fr</span>
          </div>
          <p className="text-xs text-gray-400">
            ERP.immo n'est pas un service gouvernemental. Les données affichées proviennent des APIs
            officielles publiques. L'utilisateur est responsable de la vérification des informations avant usage.
          </p>
        </div>
      </footer>
    </div>
  );
}
