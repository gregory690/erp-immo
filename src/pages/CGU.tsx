import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function CGU() {
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
        <h1 className="text-3xl font-black text-navy-900 mb-2">Conditions Générales d'Utilisation et de Vente</h1>
        <p className="text-sm text-gray-400 mb-10">En vigueur au 1er janvier 2026 — Applicables à tout achat sur erp-immo.vercel.app</p>

        <section className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation et de Vente (CGU/CGV) régissent l'utilisation du service de génération d'État des Risques et Pollutions (ERP) en ligne proposé par EDL &amp; DIAGNOSTIC SAS. Tout accès au service implique l'acceptation pleine et entière des présentes conditions.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">2. Description du service</h2>
            <p>EDL &amp; DIAGNOSTIC SAS met à disposition un outil en ligne permettant de générer un État des Risques et Pollutions (ERP) conforme à l'arrêté du 27 septembre 2022, à partir des données officielles publiques (Géorisques, BAN, IGN).</p>
            <p className="mt-2">Le document généré est un ERP au format PDF, valable 6 mois à compter de sa date d'établissement, destiné à être annexé à un compromis de vente ou à un contrat de bail (art. L125-5 du Code de l'Environnement).</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">3. Prix et paiement</h2>
            <p>Le prix du service est de <strong>19,99 € TTC (16,66 € HT)</strong> par document généré. Ce tarif est susceptible d'être modifié à tout moment ; le prix applicable est celui affiché au moment de la commande.</p>
            <p className="mt-2">Le paiement est effectué en ligne par carte bancaire, via la plateforme sécurisée Stripe (3D Secure). Le paiement est débité immédiatement lors de la validation de la commande.</p>
            <p className="mt-2">Aucun abonnement n'est souscrit. Chaque document fait l'objet d'un achat distinct.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">4. Livraison</h2>
            <p>Le document ERP est disponible immédiatement après confirmation du paiement, sous forme de fichier PDF téléchargeable depuis le site. Un email récapitulatif contenant un lien de téléchargement est envoyé à l'adresse email renseignée lors de la commande.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">5. Droit de rétractation</h2>
            <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation de 14 jours ne s'applique pas aux contenus numériques dont l'exécution a commencé avec l'accord préalable du consommateur et sa renonciation expresse à son droit de rétractation.</p>
            <p className="mt-2">En procédant au paiement et au téléchargement du document, l'utilisateur reconnaît renoncer expressément à son droit de rétractation.</p>
            <p className="mt-2">Toutefois, en cas d'insatisfaction avérée, EDL &amp; DIAGNOSTIC SAS s'engage à examiner toute réclamation dans les 7 jours suivant l'achat. Contact : <strong>notifications@edl-diagnostic-erp.fr</strong></p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">6. Obligations de l'utilisateur</h2>
            <p>L'utilisateur s'engage à :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li>Fournir des informations exactes (adresse du bien, coordonnées)</li>
              <li>Utiliser le document généré uniquement dans le cadre légal prévu (vente ou location immobilière)</li>
              <li>Vérifier que le document est daté, paraphé et signé par le vendeur ou bailleur avant transmission au notaire ou locataire</li>
              <li>Ne pas reproduire, revendre ou diffuser le service sans autorisation</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">7. Responsabilité</h2>
            <p>EDL &amp; DIAGNOSTIC SAS génère les ERP à partir des données officielles publiques et ne peut être tenu responsable :</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              <li>D'une erreur ou d'un retard de mise à jour dans les bases de données officielles</li>
              <li>D'une mauvaise utilisation du document par l'utilisateur</li>
              <li>Du refus d'un notaire ou d'une agence d'accepter le document (cas rare, non fondé légalement)</li>
              <li>D'une interruption temporaire du service pour maintenance</li>
            </ul>
            <p className="mt-2">La responsabilité d'EDL &amp; DIAGNOSTIC SAS est en tout état de cause limitée au montant payé pour la commande concernée.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">8. Propriété intellectuelle</h2>
            <p>Le service, son interface, ses textes et son code source sont la propriété exclusive d'EDL &amp; DIAGNOSTIC SAS. Le document ERP généré est remis à l'utilisateur pour un usage strictement personnel et non commercial.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">9. Médiation des litiges</h2>
            <p>En cas de litige, l'utilisateur peut recourir gratuitement à un médiateur de la consommation. Pour toute réclamation préalable : <strong>notifications@edl-diagnostic-erp.fr</strong></p>
            <p className="mt-2">Plateforme européenne de règlement en ligne des litiges : <strong>https://ec.europa.eu/consumers/odr</strong></p>
          </div>

          <div>
            <h2 className="text-base font-bold text-navy-900 mb-3 pb-2 border-b border-gray-100">10. Droit applicable</h2>
            <p>Les présentes CGU/CGV sont soumises au droit français. Tout litige relève de la compétence des tribunaux du ressort de Brest.</p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8 px-4 mt-16">
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-400">
          <p>© 2026 EDL&amp;DIAGNOSTIC · <button onClick={() => navigate('/mentions-legales')} className="hover:text-white underline">Mentions légales</button> · <button onClick={() => navigate('/confidentialite')} className="hover:text-white underline">Politique de confidentialité</button></p>
        </div>
      </footer>
    </div>
  );
}
