import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Confidentialite() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <div className="bg-edl-700 rounded p-1.5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-navy-900 text-lg tracking-tight">EDL<span className="text-edl-700">&</span>DIAGNOSTIC</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-navy-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-400 mb-10">En vigueur au 1er août 2025 — Conforme au Règlement (UE) 2016/679 (RGPD)</p>

        <section className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">1. Responsable du traitement</h2>
            <ul className="space-y-1 pl-4">
              <li><strong>Société :</strong> EDL &amp; DIAGNOSTIC SAS</li>
              <li><strong>RCS :</strong> Brest n° 832 877 179</li>
              <li><strong>Siège :</strong> 60 Allée de Provence, 29280 Plouzané, France</li>
              <li><strong>Contact DPO :</strong> notifications@edl-diagnostic-erp.fr</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">2. Données collectées</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mt-2">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-2.5 border border-gray-200 font-semibold text-navy-900">Catégorie</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold text-navy-900">Données</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold text-navy-900">Finalité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 border border-gray-200 font-medium">Commande ERP</td>
                    <td className="p-2.5 border border-gray-200">Adresse email, adresse du bien, données cadastrales</td>
                    <td className="p-2.5 border border-gray-200">Génération du document, envoi par email</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2.5 border border-gray-200 font-medium">Paiement</td>
                    <td className="p-2.5 border border-gray-200">Données de carte bancaire (traitées par Stripe, non stockées)</td>
                    <td className="p-2.5 border border-gray-200">Traitement du paiement sécurisé</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-gray-200 font-medium">Navigation</td>
                    <td className="p-2.5 border border-gray-200">Données de connexion, pages visitées</td>
                    <td className="p-2.5 border border-gray-200">Statistiques, amélioration du service</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2.5 border border-gray-200 font-medium">Documents ERP</td>
                    <td className="p-2.5 border border-gray-200">Contenu du document (bien, risques, référence)</td>
                    <td className="p-2.5 border border-gray-200">Stockage temporaire pour re-téléchargement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">3. Base légale des traitements</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li><strong>Exécution du contrat :</strong> génération et livraison de l'ERP, envoi de l'email de confirmation</li>
              <li><strong>Intérêt légitime :</strong> amélioration du service, statistiques de navigation</li>
              <li><strong>Consentement :</strong> communications commerciales optionnelles</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">4. Durées de conservation</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li><strong>Documents ERP :</strong> 180 jours après génération (stockage chiffré côté serveur)</li>
              <li><strong>Données de commande :</strong> 3 ans à compter du dernier contact</li>
              <li><strong>Données de connexion :</strong> 12 mois</li>
              <li><strong>Données de paiement :</strong> non stockées (traitées exclusivement par Stripe)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">5. Destinataires des données</h2>
            <p>Les données peuvent être transmises aux sous-traitants suivants, qui agissent uniquement sur instruction d'EDL &amp; DIAGNOSTIC SAS :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li><strong>Stripe :</strong> traitement des paiements (USA — clauses contractuelles types)</li>
              <li><strong>Resend :</strong> envoi des emails transactionnels</li>
              <li><strong>Vercel :</strong> hébergement du service (USA — clauses contractuelles types)</li>
            </ul>
            <p className="mt-2">Aucune donnée n'est vendue ou cédée à des tiers à des fins publicitaires.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">6. Vos droits (RGPD)</h2>
            <p>Conformément aux articles 15 à 21 du RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li><strong>Accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Rectification :</strong> corriger des données inexactes</li>
              <li><strong>Effacement :</strong> demander la suppression de vos données ("droit à l'oubli")</li>
              <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Opposition :</strong> vous opposer à un traitement basé sur l'intérêt légitime</li>
              <li><strong>Limitation :</strong> limiter le traitement de vos données dans certains cas</li>
            </ul>
            <p className="mt-3">Pour exercer vos droits : <strong>notifications@edl-diagnostic-erp.fr</strong> — Réponse sous 30 jours.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">7. Cookies</h2>
            <p>Ce site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du service (session, préférences de navigation). Aucun cookie publicitaire ou de traçage tiers n'est déposé.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">8. Sécurité</h2>
            <p>EDL &amp; DIAGNOSTIC SAS met en place des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement HTTPS, accès restreints, stockage sécurisé des documents ERP, paiements traités exclusivement par Stripe (certifié PCI DSS).</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">9. Réclamation auprès de la CNIL</h2>
            <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :</p>
            <ul className="mt-2 space-y-1 pl-4">
              <li><strong>CNIL</strong> — Commission Nationale de l'Informatique et des Libertés</li>
              <li>3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
              <li>www.cnil.fr</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">10. Modification de la politique</h2>
            <p>La présente politique peut être mise à jour à tout moment. La date de dernière mise à jour est indiquée en haut de page. Il appartient à l'utilisateur de la consulter régulièrement.</p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8 px-4 mt-16">
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-400">
          <p>© 2026 EDL&amp;DIAGNOSTIC · <button onClick={() => navigate('/mentions-legales')} className="hover:text-white underline">Mentions légales</button> · <button onClick={() => navigate('/cgu')} className="hover:text-white underline">CGU / CGV</button></p>
        </div>
      </footer>
    </div>
  );
}
