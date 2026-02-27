import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ChevronDown } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    categorie: "L'ERP en général",
    questions: [
      {
        q: "Qu'est-ce que l'ERP (État des Risques et Pollutions) ?",
        r: "L'ERP est un document légal obligatoire en France pour toute transaction immobilière (vente ou location). Il informe l'acquéreur ou le locataire sur les risques naturels, miniers, technologiques, sismiques, la pollution des sols et les nuisances sonores aériennes auxquels le bien est exposé. Il est encadré par l'article L125-5 du Code de l'environnement et l'arrêté du 27 septembre 2022.",
      },
      {
        q: "Pour quels types de transactions l'ERP est-il obligatoire ?",
        r: "L'ERP est obligatoire pour toute vente (compromis, promesse, acte authentique), location (habitation meublée ou non meublée, bail étudiant, location saisonnière, bail commercial), VEFA (remis au contrat de réservation) et échanges immobiliers. Il n'existe pas de cas d'exonération pour les propriétaires · seules les ventes judiciaires font exception.",
      },
      {
        q: "Quelle est la différence entre l'ERP et les autres diagnostics immobiliers ?",
        r: "C'est le seul diagnostic immobilier que le propriétaire peut établir lui-même, sans recourir à un diagnostiqueur certifié. Il est basé exclusivement sur des données géographiques officielles (sans visite du bien), ce qui permet de le générer en ligne. Les autres diagnostics (DPE, amiante, plomb…) nécessitent l'intervention d'un professionnel accrédité.",
      },
      {
        q: "L'ERP couvre-t-il tout le territoire français ?",
        r: "Oui. Le zonage sismique (zones 1 à 5) et le potentiel radon (catégories 1 à 3) couvrent l'ensemble du territoire. D'autres sections (PPR, SIS, CatNat) s'appliquent selon la situation géographique du bien. Il n'existe aucun bien immobilier en France pour lequel l'ERP n'est pas nécessaire.",
      },
      {
        q: "Qu'est-ce que la nouveauté 2025 sur le débroussaillement ?",
        r: "Depuis le 1er janvier 2025 (décret 2024-405 du 29 avril 2024), les Obligations Légales de Débroussaillement (OLD) doivent figurer dans l'ERP pour les biens situés en zone exposée aux feux de forêt et de végétation. Une fiche spécifique est disponible sur georisques.gouv.fr.",
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
        r: "Oui. Notre document respecte le format officiel imposé par l'arrêté du 27 septembre 2022. Il intègre toutes les rubriques obligatoires : PPRN, PPRM, PPRT, zonage sismique, SIS, radon, ENSA (nuisances sonores aériennes) et déclaration de sinistres. Les données proviennent exclusivement de sources officielles.",
      },
      {
        q: "D'où proviennent les données ?",
        r: "Exclusivement de bases officielles françaises : Géorisques (georisques.gouv.fr) pour les risques naturels, technologiques et miniers, la Base Adresse Nationale (data.gouv.fr) pour le géocodage, l'API Carto de l'IGN (apicarto.ign.fr) pour les références cadastrales, et le BRGM pour les données géologiques (argiles, radon).",
      },
      {
        q: "Combien coûte un ERP via votre service ?",
        r: "Un ERP complet coûte 19,99 €. Ce tarif inclut la génération du document, la livraison par email et la possibilité de retélécharger le document à tout moment via un lien sécurisé.",
      },
    ],
  },
  {
    categorie: "Validité et obligations",
    questions: [
      {
        q: "Combien de temps est valable un ERP ?",
        r: "Un ERP est valable 6 mois à compter de sa date d'établissement, conformément à l'article L125-5 III du Code de l'environnement. Attention : la jurisprudence (Cour de cassation, 3e ch. civile, 19 sept. 2019) précise que la validité doit être appréciée à la date de l'acte authentique. Si le classement du bien évolue entre le compromis et la vente définitive, un ERP à jour est obligatoire.",
      },
      {
        q: "Quelles sont les sanctions si l'ERP est absent ou erroné ?",
        r: "Les sanctions sont exclusivement civiles · il n'existe pas de sanction pénale spécifique. Pour une vente : l'acquéreur peut demander la résolution du contrat ou une diminution du prix (art. L125-5 Code de l'environnement). Pour une location : le locataire peut demander la nullité du bail ou son maintien sans obligation de payer le loyer jusqu'à régularisation.",
      },
      {
        q: "Faut-il faire signer l'ERP ?",
        r: "La loi impose que l'ERP soit annexé à l'acte, ce qui suppose que les parties en accusent réception. En pratique, la signature de l'acquéreur ou du locataire est indispensable pour prouver la remise du document. Sans cette preuve, le vendeur ou bailleur ne peut pas établir qu'il a rempli son obligation légale.",
      },
      {
        q: "Faut-il mentionner les risques dès l'annonce immobilière ?",
        r: "Oui. Depuis le 1er janvier 2023 (décret 2022-1289), le vendeur ou bailleur doit mentionner les risques dès la publication de l'annonce immobilière ou lors de la première visite du bien. Cette obligation s'ajoute à la remise formelle de l'ERP au moment du compromis ou du bail.",
      },
      {
        q: "L'ERP doit-il être refait si la vente prend du temps ?",
        r: "Oui, si l'ERP dépasse les 6 mois avant la signature de l'acte authentique. Et même dans ce délai, si le classement du bien évolue (nouveau PPR, nouvel arrêté CatNat), une mise à jour est obligatoire selon la jurisprudence de la Cour de cassation.",
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
        q: "Je n'ai pas reçu l'email · que faire ?",
        r: "Vérifiez votre dossier spam ou courrier indésirable. Si l'email n'y est pas, contactez-nous à contact@edl-diagnostic-erp.fr avec votre référence de paiement et nous vous renverrons le document.",
      },
      {
        q: "Peut-on modifier un ERP après génération ?",
        r: "Non. Une fois généré, le document est figé à sa date de réalisation. Si une information est incorrecte ou si l'adresse a changé, il faut générer un nouvel ERP.",
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
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 sm:space-y-10">
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

        {/* Sources */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-700 mb-1">Sources réglementaires</p>
          <p>Article L125-5 du Code de l'environnement · Arrêté du 27 septembre 2022 · Décret 2022-1289 · Décret 2024-405 du 29 avril 2024 · Cour de cassation, 3e ch. civ., 19 sept. 2019 · georisques.gouv.fr · legifrance.gouv.fr</p>
        </div>

        {/* CTA contact */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-8 text-center">
          <h3 className="text-lg font-black text-navy-900 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-gray-500 text-sm mb-5">
            Notre équipe répond rapidement par email à toute question sur l'ERP ou notre service.
          </p>
          <a
            href="mailto:contact@edl-diagnostic-erp.fr"
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
            Établir mon ERP · 19,99 €
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
