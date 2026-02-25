import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ArrowRight, ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const FAQ_CATEGORIES = [
  {
    categorie: "L'ERP en général",
    questions: [
      {
        q: "Qu'est-ce que l'ERP (État des Risques et Pollutions) ?",
        r: "L'ERP est un document légal obligatoire en France pour toute transaction immobilière (vente ou location). Il informe l'acquéreur ou le locataire sur les risques naturels, miniers, technologiques, sismiques et de pollution des sols auxquels le bien est exposé. Il est encadré par l'arrêté du 27 septembre 2022.",
      },
      {
        q: "Pour quelle transaction l'ERP est-il obligatoire ?",
        r: "L'ERP est obligatoire pour toute vente ou mise en location d'un bien immobilier bâti ou non bâti. Il doit être annexé au compromis de vente, à la promesse de vente, ou au contrat de bail. Sans ERP, le notaire ne peut pas instrumenter.",
      },
      {
        q: "Quelle est la différence entre ERP et diagnostic immobilier classique ?",
        r: "Les diagnostics classiques (DPE, amiante, plomb, etc.) sont réalisés par des diagnostiqueurs certifiés après visite du bien. L'ERP, lui, ne nécessite pas de visite — il est basé sur des données géographiques officielles. Il peut donc être établi en ligne, par n'importe qui, sans certification professionnelle.",
      },
      {
        q: "L'ERP couvre-t-il tout le territoire français ?",
        r: "Oui. Même si tous les risques ne s'appliquent pas partout, le zonage sismique et le potentiel radon couvrent l'ensemble du territoire. Il n'existe donc aucun bien immobilier en France pour lequel l'ERP n'est pas nécessaire.",
      },
    ],
  },
  {
    categorie: "Notre service",
    questions: [
      {
        q: "Comment fonctionne votre service ?",
        r: "Vous saisissez l'adresse du bien, nous récupérons automatiquement toutes les données officielles (Géorisques, BRGM, IGN, Base Adresse Nationale) et générons un document ERP conforme à l'arrêté du 27/09/2022. L'ensemble du processus prend moins de 2 minutes.",
      },
      {
        q: "L'ERP généré est-il accepté par les notaires ?",
        r: "Oui. Notre document respecte scrupuleusement le format officiel imposé par l'arrêté du 27 septembre 2022. Il intègre toutes les rubriques obligatoires : PPRN, PPRM, PPRT, zonage sismique, SIS, radon, ENSA et déclaration de sinistres. Les données proviennent exclusivement de sources officielles.",
      },
      {
        q: "D'où proviennent les données ?",
        r: "Toutes les données proviennent de bases officielles françaises : Géorisques (georisques.gouv.fr) pour les risques, la Base Adresse Nationale pour le géocodage, l'API Carto de l'IGN pour les références cadastrales, et le BRGM pour les données géologiques. Aucune donnée privée ou estimée n'est utilisée.",
      },
      {
        q: "Combien coûte un ERP via votre service ?",
        r: "Un ERP complet coûte 19,99 €. Ce tarif inclut la génération du document, la livraison par email et la possibilité de retélécharger le document à tout moment pendant 6 mois via un lien sécurisé.",
      },
      {
        q: "Peut-on générer un ERP pour n'importe quel bien ?",
        r: "Oui, pour tout bien en France métropolitaine et dans les départements d'outre-mer. Il suffit de connaître l'adresse complète du bien. Les références cadastrales sont récupérées automatiquement.",
      },
    ],
  },
  {
    categorie: "Validité et obligations",
    questions: [
      {
        q: "Combien de temps est valable un ERP ?",
        r: "Un ERP est valable 6 mois à compter de sa date de réalisation. Au-delà, il doit être renouvelé — même si les conditions du bien n'ont pas changé, car les données officielles sont susceptibles d'évoluer.",
      },
      {
        q: "Quelles sont les sanctions si l'ERP est absent ou erroné ?",
        r: "L'acquéreur ou le locataire peut demander la résolution du contrat ou une réduction du prix de vente. Le vendeur ou bailleur engage sa responsabilité civile. En pratique, les notaires refusent systématiquement de signer sans ERP valide.",
      },
      {
        q: "Faut-il faire signer l'ERP ?",
        r: "Oui. L'ERP doit être daté et signé par le vendeur (ou bailleur) ET par l'acquéreur (ou locataire). Cette double signature atteste que les deux parties ont bien pris connaissance des risques. Notre document inclut les cases de signature conformément au modèle officiel.",
      },
      {
        q: "L'ERP doit-il être refait si la vente prend du temps ?",
        r: "Si la vente dure plus de 6 mois entre la date de l'ERP et la signature définitive, il faut en refaire un. C'est pour ça qu'il vaut mieux le générer proche de la date du compromis plutôt que trop tôt.",
      },
    ],
  },
  {
    categorie: "Après l'achat",
    questions: [
      {
        q: "Comment récupérer mon ERP après paiement ?",
        r: "Un email vous est envoyé automatiquement dès la confirmation du paiement. Il contient un lien pour télécharger votre ERP en PDF. Ce lien reste valide et vous pouvez retélécharger le document à tout moment.",
      },
      {
        q: "Je n'ai pas reçu l'email — que faire ?",
        r: "Vérifiez votre dossier spam ou courrier indésirable. Si l'email n'y est pas non plus, contactez-nous via le formulaire de contact avec votre référence de paiement Stripe, nous vous renverrons le document.",
      },
      {
        q: "Peut-on modifier un ERP après génération ?",
        r: "Non. Une fois généré, le document est figé à la date de réalisation. Si des informations ont changé ou si vous souhaitez corriger une erreur d'adresse, il faut générer un nouvel ERP.",
      },
    ],
  },
];

function FAQItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-start justify-between gap-4 py-4 text-left hover:text-navy-900 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-navy-900 leading-relaxed">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed pr-8">
          {r}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <div className="bg-edl-700 rounded p-1.5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-navy-900 text-lg tracking-tight">
                EDL<span className="text-edl-700">&</span>DIAGNOSTIC
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-edl-700 hover:bg-edl-800"
            onClick={() => navigate('/generer')}
          >
            Générer mon ERP
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-navy-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-edl-700 rounded-xl p-3">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black mb-3">Questions fréquentes</h1>
          <p className="text-navy-200 text-base max-w-xl mx-auto">
            Toutes les réponses sur l'ERP, son fonctionnement, et notre service.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {FAQ_CATEGORIES.map((cat) => (
          <section key={cat.categorie}>
            <h2 className="text-lg font-black text-navy-900 mb-4 pb-2 border-b-2 border-edl-700 inline-block pr-4">
              {cat.categorie}
            </h2>
            <div className="divide-y divide-gray-100">
              {cat.questions.map((item) => (
                <FAQItem key={item.q} q={item.q} r={item.r} />
              ))}
            </div>
          </section>
        ))}

        {/* CTA contact */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-8 text-center">
          <h3 className="text-lg font-black text-navy-900 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-gray-500 text-sm mb-5">
            Notre équipe répond rapidement par email à toute question sur l'ERP ou notre service.
          </p>
          <a
            href="mailto:contact@edletdiagnostic.fr"
            className="inline-flex items-center gap-2 bg-navy-900 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-navy-800 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Nous contacter
          </a>
        </div>

        {/* CTA génération */}
        <div className="bg-edl-700 text-white rounded-2xl px-6 py-8 text-center">
          <h3 className="text-xl font-black mb-2">Prêt à générer votre ERP ?</h3>
          <p className="text-red-100 text-sm mb-5">
            2 minutes · Données officielles · Accepté par les notaires
          </p>
          <Button
            size="lg"
            className="bg-white text-edl-700 hover:bg-gray-100 font-bold"
            onClick={() => navigate('/generer')}
          >
            Établir mon ERP — 19,99 €
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-xs text-gray-400">
        <p>
          © {new Date().getFullYear()} EDL&DIAGNOSTIC ·{' '}
          <button onClick={() => navigate('/mentions-legales')} className="hover:text-navy-900 underline">Mentions légales</button>
          {' '}·{' '}
          <button onClick={() => navigate('/cgu')} className="hover:text-navy-900 underline">CGU</button>
        </p>
      </footer>
    </div>
  );
}
