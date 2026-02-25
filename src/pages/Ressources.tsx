import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';

const ARTICLES = [
  {
    slug: 'erp-obligatoire',
    tag: "Réglementation",
    titre: "L'ERP est-il vraiment obligatoire ?",
    intro: "Oui, sans exception. L'état des risques et pollutions est imposé par l'article L125-5 du Code de l'environnement pour toute vente ou location d'un bien immobilier situé dans une zone couverte par un plan de prévention des risques, une zone de sismicité, ou présentant un potentiel radon.",
    contenu: [
      {
        titre: "Ce que dit la loi",
        texte: "L'article L125-5 du Code de l'environnement impose à tout vendeur ou bailleur de fournir un ERP lors de la signature du compromis de vente ou du contrat de location. Le document doit être annexé à l'acte. Depuis le 1er janvier 2023 (décret 2022-1289), l'information sur les risques doit également être mentionnée dès l'annonce immobilière ou lors de la première visite.",
      },
      {
        titre: "Qui est concerné ?",
        texte: "Toutes les communes de France sont concernées par au moins une rubrique de l'ERP (le zonage sismique et le potentiel radon couvrent l'ensemble du territoire). En pratique, il n'existe aucun bien immobilier pour lequel l'ERP n'est pas requis.",
      },
      {
        titre: "Nouveauté 2025 : les Obligations Légales de Débroussaillement",
        texte: "Depuis le 1er janvier 2025 (décret 2024-405 du 29 avril 2024), si le bien est situé dans une zone assujettie au débroussaillement obligatoire (forêts, landes, zones exposées aux feux), cette information doit obligatoirement figurer dans l'ERP. Une fiche spécifique est disponible sur georisques.gouv.fr.",
      },
      {
        titre: "Et si on ne le fournit pas ?",
        texte: "Les sanctions sont exclusivement civiles — il n'existe aucune sanction pénale spécifique à l'absence d'ERP. Pour une vente, l'acquéreur peut demander la résolution du contrat ou une diminution du prix (article L125-5 du Code de l'environnement). Pour une location, le locataire peut demander la nullité du bail ou son maintien sans obligation de payer de loyer jusqu'à régularisation.",
      },
    ],
  },
  {
    slug: 'qui-fournit-erp',
    tag: "Pratique",
    titre: "Qui doit fournir l'ERP : vendeur ou acheteur ?",
    intro: "C'est toujours le vendeur (ou le bailleur) qui a l'obligation légale de fournir l'ERP. C'est le seul diagnostic immobilier que le propriétaire peut rédiger lui-même, sans recourir à un diagnostiqueur certifié.",
    contenu: [
      {
        titre: "Une spécificité de l'ERP",
        texte: "Contrairement aux autres diagnostics immobiliers (DPE, amiante, plomb…), l'ERP ne nécessite pas l'intervention d'un professionnel certifié. Le propriétaire peut l'établir lui-même, via un service en ligne ou en remplissant le formulaire officiel disponible sur georisques.gouv.fr. La responsabilité légale reste néanmoins la sienne.",
      },
      {
        titre: "Côté agent immobilier",
        texte: "L'agent immobilier peut accompagner le vendeur dans la démarche, mais ne se substitue pas à lui sur le plan de la responsabilité. En cas d'information incomplète ou erronée, c'est le vendeur ou bailleur qui est en cause.",
      },
      {
        titre: "Obligation dès l'annonce",
        texte: "Depuis le 1er janvier 2023, le vendeur ou bailleur doit mentionner les risques dès la publication de l'annonce immobilière. Cette obligation précède la remise formelle de l'ERP au moment du compromis ou du bail.",
      },
      {
        titre: "Et pour la location ?",
        texte: "Pour tout bail (habitation meublée ou non meublée, étudiant, saisonnier, commercial), c'est le bailleur qui fournit l'ERP, annexé au contrat avant signature. Il doit être renouvelé si la location est reconduite et que le document a expiré.",
      },
    ],
  },
  {
    slug: 'validite-erp',
    tag: "Durée de validité",
    titre: "Combien de temps est valable un ERP ?",
    intro: "Un ERP est valable 6 mois à compter de sa date d'établissement. Au-delà, il doit être refait. Mais attention : même dans ce délai, une mise à jour peut être obligatoire si la situation du bien évolue.",
    contenu: [
      {
        titre: "La règle des 6 mois",
        texte: "L'article L125-5 III du Code de l'environnement précise que l'ERP « doit être établi moins de six mois avant la conclusion de tout contrat de location écrit, de toute promesse de vente ou d'acte réalisant ou constatant la vente ». La validité court à partir de la date inscrite sur le document.",
      },
      {
        titre: "Un point important : la validité doit tenir jusqu'à l'acte authentique",
        texte: "La Cour de cassation (3e ch. civile, 19 septembre 2019) a jugé que le manquement à l'obligation d'information s'apprécie à la date de l'acte authentique, pas uniquement au compromis. Si la situation du bien évolue (nouveau PPR, nouvel arrêté CatNat) entre le compromis et la signature définitive, l'ERP initial devient caduc et doit être mis à jour même s'il avait moins de 6 mois.",
      },
      {
        titre: "Que faire si l'ERP expire avant la vente ?",
        texte: "Il faut en refaire un. Si votre vente prend plus de temps que prévu et que l'ERP expire avant la signature définitive chez le notaire, il faudra en générer un nouveau. Idéalement, générez votre ERP au moment du compromis plutôt que trop en avance.",
      },
    ],
  },
  {
    slug: 'erp-expire',
    tag: "À savoir",
    titre: "Mon ERP est expiré — que faire ?",
    intro: "Si votre ERP a plus de 6 mois, il n'est plus valide légalement. La solution est simple : en générer un nouveau. Les données officielles sont actualisées automatiquement lors de chaque nouvelle génération.",
    contenu: [
      {
        titre: "Un ERP expiré peut-il bloquer la vente ?",
        texte: "Oui. Le notaire vérifiera la date de réalisation du document. Si l'ERP est expiré au moment de la signature de l'acte définitif, il demandera un document à jour avant de procéder. La plupart des notaires l'exigent aussi valide au moment du compromis.",
      },
      {
        titre: "Est-ce que les risques changent souvent ?",
        texte: "Pas systématiquement, mais ça arrive. Un nouveau PPR peut être prescrit ou approuvé, un arrêté de catastrophe naturelle peut être publié, ou les données de la commune peuvent évoluer. L'ERP reflète la situation à sa date de réalisation — c'est pourquoi la loi impose ce délai de 6 mois.",
      },
      {
        titre: "Comment renouveler rapidement ?",
        texte: "Via notre service, un nouvel ERP est généré en moins de 2 minutes pour le même bien. Il suffit de saisir à nouveau l'adresse — toutes les données sont récupérées en temps réel depuis les bases officielles (Géorisques, IGN, Base Adresse Nationale).",
      },
    ],
  },
  {
    slug: 'lire-erp',
    tag: "Comprendre",
    titre: "Comment lire et interpréter son ERP ?",
    intro: "L'ERP est structuré en plusieurs sections correspondant chacune à un type de risque, conformément à l'arrêté du 27 septembre 2022. Voici les points essentiels pour le comprendre.",
    contenu: [
      {
        titre: "Les PPR : plans de prévention des risques",
        texte: "Un PPR prescrit signifie que la commune a identifié un risque et engagé une procédure. Un PPR approuvé est le plus contraignant : il impose des règles de construction et peut prescrire des travaux obligatoires. Le PPR naturel (PPRN) couvre inondations, mouvements de terrain, séismes, avalanches, feux de forêt et submersion marine. Le PPR technologique (PPRT) concerne les installations industrielles dangereuses (sites SEVESO).",
      },
      {
        titre: "Zonage sismique et radon",
        texte: "Le zonage sismique va de 1 (très faible, exempté des règles parasismiques) à 5 (forte). En zone 2 et au-delà, des règles de construction parasismiques s'appliquent selon la catégorie du bâtiment. Le potentiel radon va de 1 à 3 — en zone 3, des mesures de prévention sont recommandées dans les logements.",
      },
      {
        titre: "CatNat : les arrêtés de catastrophe naturelle",
        texte: "La liste des CatNat recense tous les événements reconnus comme catastrophes naturelles sur la commune par arrêté interministériel. Attention : cela concerne la commune entière, pas nécessairement votre bien. L'ERP demande séparément si le bien lui-même a fait l'objet de sinistres indemnisés.",
      },
      {
        titre: "SIS et pollution des sols",
        texte: "Le Secteur d'Information sur les Sols (SIS) signale que le terrain est ou a été exposé à une pollution. Si votre bien est en SIS, des études de sols sont obligatoires avant toute mutation (article L125-6 du Code de l'environnement). Les bases BASIAS et BASOL recensent les anciens sites industriels ou pollués à proximité.",
      },
    ],
  },
];

export default function Ressources() {
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
              <BookOpen className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black mb-3">Guide de l'ERP</h1>
          <p className="text-navy-200 text-base max-w-xl mx-auto">
            Tout ce qu'il faut savoir sur l'état des risques et pollutions — obligations légales, durée de validité, lecture du document.
          </p>
          <p className="text-navy-300 text-xs mt-3">
            Sources : article L125-5 Code de l'environnement · arrêté du 27/09/2022 · décret 2024-405 · georisques.gouv.fr
          </p>
        </div>
      </div>

      {/* Articles */}
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-16">
        {ARTICLES.map((article) => (
          <article key={article.slug} className="scroll-mt-24">
            <div className="mb-5">
              <span className="inline-block text-xs font-semibold text-edl-700 bg-red-50 border border-red-100 rounded-full px-3 py-1 mb-3">
                {article.tag}
              </span>
              <h2 className="text-2xl font-black text-navy-900 mb-3">{article.titre}</h2>
              <p className="text-gray-600 text-base leading-relaxed border-l-4 border-edl-700 pl-4 bg-gray-50 py-3 pr-3 rounded-r-lg">
                {article.intro}
              </p>
            </div>

            <div className="space-y-5">
              {article.contenu.map((section, i) => (
                <div key={i}>
                  <h3 className="font-bold text-navy-900 text-base mb-1.5">{section.titre}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{section.texte}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100" />
          </article>
        ))}

        {/* Source officielle */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-700 mb-1">Sources réglementaires</p>
          <p>Article L125-5 du Code de l'environnement · Arrêté du 27 septembre 2022 · Décret 2022-1289 · Décret 2024-405 du 29 avril 2024 · georisques.gouv.fr · legifrance.gouv.fr</p>
        </div>

        {/* CTA */}
        <div className="bg-navy-900 text-white rounded-2xl px-6 py-8 text-center">
          <h3 className="text-xl font-black mb-2">Prêt à générer votre ERP ?</h3>
          <p className="text-navy-200 text-sm mb-5">
            Conforme à l'arrêté du 27/09/2022 — données officielles — accepté par les notaires.
          </p>
          <Button
            size="lg"
            className="bg-edl-700 hover:bg-edl-800 font-bold"
            onClick={() => navigate('/generer')}
          >
            Établir mon ERP — 19,99 €
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} EDL&DIAGNOSTIC · <button onClick={() => navigate('/mentions-legales')} className="hover:text-navy-900 underline">Mentions légales</button> · <button onClick={() => navigate('/cgu')} className="hover:text-navy-900 underline">CGU</button></p>
      </footer>
    </div>
  );
}
