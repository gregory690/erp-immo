import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';

const ARTICLES = [
  {
    slug: 'erp-obligatoire',
    tag: "Réglementation",
    titre: "L'ERP est-il vraiment obligatoire ?",
    intro: "Oui, sans exception. L'état des risques et pollutions est exigé par la loi pour toute vente ou location d'un bien immobilier situé dans une zone couverte par un plan de prévention des risques, une zone de sismicité, ou présentant un potentiel radon.",
    contenu: [
      {
        titre: "Ce que dit la loi",
        texte: "L'article L125-5 du Code de l'environnement impose à tout vendeur ou bailleur de fournir un ERP lors de la signature du compromis de vente ou du contrat de location. Le document doit être annexé à l'acte, pas simplement mentionné.",
      },
      {
        titre: "Qui est concerné ?",
        texte: "Toutes les communes de France sont concernées par au moins une rubrique de l'ERP (le zonage sismique et le potentiel radon couvrent l'ensemble du territoire). En pratique, il n'existe aucun bien immobilier pour lequel l'ERP n'est pas requis.",
      },
      {
        titre: "Et si on ne le fournit pas ?",
        texte: "L'acquéreur ou le locataire peut demander la résolution du contrat ou une réduction du prix. Le vendeur ou bailleur s'expose également à des poursuites civiles. Les notaires refusent systématiquement de signer sans ce document.",
      },
    ],
  },
  {
    slug: 'qui-fournit-erp',
    tag: "Pratique",
    titre: "Qui doit fournir l'ERP : vendeur ou acheteur ?",
    intro: "C'est toujours le vendeur (ou le bailleur) qui a l'obligation de fournir l'ERP. L'acheteur ou le locataire n'a aucune démarche à faire — il reçoit le document et le signe en reconnaissance.",
    contenu: [
      {
        titre: "Côté vendeur",
        texte: "Le vendeur doit obtenir, remplir et faire signer l'ERP avant la signature du compromis. Il peut le faire lui-même via un service en ligne comme le nôtre, ou mandater un professionnel (diagnostiqueur, agent immobilier).",
      },
      {
        titre: "Côté agent immobilier",
        texte: "L'agent immobilier peut prendre en charge l'ERP pour le compte du vendeur, mais la responsabilité légale reste celle du vendeur. En cas d'erreur ou d'omission, c'est le vendeur qui est en cause.",
      },
      {
        titre: "Et pour la location ?",
        texte: "Pour un bail (habitation ou commercial), c'est le bailleur qui fournit l'ERP. Il doit être joint au contrat de location dès sa signature, et renouvelé tous les 6 mois si la location est reconduite.",
      },
    ],
  },
  {
    slug: 'validite-erp',
    tag: "Durée de validité",
    titre: "Combien de temps est valable un ERP ?",
    intro: "Un ERP est valable 6 mois à compter de sa date de réalisation. Au-delà, il doit être refait — même si le bien n'a pas changé, les données officielles des risques sont susceptibles d'être mises à jour.",
    contenu: [
      {
        titre: "Pourquoi seulement 6 mois ?",
        texte: "Les données sur les risques (plans de prévention, arrêtés de catastrophe naturelle, classements sismiques) peuvent évoluer. Un ERP établi il y a 7 mois ne reflète pas forcément la situation actuelle — d'où la limite légale de 6 mois.",
      },
      {
        titre: "Que faire si l'ERP expire avant la vente ?",
        texte: "Il faut en refaire un. Si votre vente prend plus de temps que prévu et que l'ERP expire avant la signature définitive chez le notaire, il faudra en générer un nouveau. C'est pour ça qu'il vaut mieux ne pas le faire trop en avance.",
      },
      {
        titre: "Bon moment pour le faire",
        texte: "Idéalement, générez votre ERP au moment où vous mettez le bien en vente ou en location, ou juste avant la signature du compromis. Évitez de le faire des mois à l'avance pour ne pas avoir à le renouveler.",
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
        texte: "Oui. Le notaire vérifiera la date de réalisation du document. Si l'ERP est expiré au moment de la signature de l'acte définitif, il demandera un document à jour avant de procéder. Certains notaires l'exigent aussi pour le compromis.",
      },
      {
        titre: "Est-ce que les risques changent souvent ?",
        texte: "Pas toujours, mais ça arrive. Un nouveau PPRN peut être prescrit, un arrêté de catastrophe naturelle peut être publié, ou la commune peut changer de classement sismique. L'ERP reflète la situation à la date de sa réalisation.",
      },
      {
        titre: "Comment renouveler rapidement ?",
        texte: "Via notre service, un nouvel ERP est généré en moins de 2 minutes pour le même bien. Il suffit de saisir à nouveau l'adresse — toutes les données sont récupérées en temps réel depuis les bases officielles.",
      },
    ],
  },
  {
    slug: 'lire-erp',
    tag: "Comprendre",
    titre: "Comment lire et interpréter son ERP ?",
    intro: "L'ERP est un document officiel structuré en plusieurs sections. Chaque section correspond à un type de risque. Voici comment le déchiffrer rapidement pour comprendre la situation réelle de votre bien.",
    contenu: [
      {
        titre: "Les PPR : plans de prévention des risques",
        texte: "Un PPR prescrit signifie que la commune a identifié un risque et engagé une procédure. Un PPR approuvé est le plus contraignant : il impose des règles de construction et peut prescrire des travaux obligatoires dans un délai de 5 ans.",
      },
      {
        titre: "Zonage sismique et radon",
        texte: "Le zonage sismique va de 1 (très faible) à 5 (forte). En zone 3 ou plus, des règles parasismiques s'appliquent. Le potentiel radon va de 1 à 3 — en zone 3, des mesures préventives sont recommandées dans les logements.",
      },
      {
        titre: "CatNat : les arrêtés de catastrophe naturelle",
        texte: "La liste des CatNat recense tous les événements reconnus comme catastrophes naturelles sur la commune. Attention : ça concerne la commune entière, pas forcément le bien. Il faut vérifier si le bien lui-même a subi des dommages indemnisés.",
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
